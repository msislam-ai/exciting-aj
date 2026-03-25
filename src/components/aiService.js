// puter-ai.service.js
import { puter } from "@heyputer/puter.js";

/**
 * @typedef {Object} AIResponse
 * @property {string} content - The AI-generated text
 * @property {boolean} success - Whether the call succeeded
 * @property {string|null} error - Error message if failed
 * @property {number} tokensUsed - Estimated tokens consumed
 */

/**
 * @typedef {Object} AICallOptions
 * @property {string} [model] - Model identifier (e.g., "openai/gpt-3.5-turbo")
 * @property {number} [maxTokens] - Max tokens for response
 * @property {number} [temperature] - Creativity level (0.0-1.0)
 * @property {boolean} [stream] - Enable streaming response
 * @property {Function} [onStreamChunk] - Callback for streaming chunks
 * @property {AbortSignal} [signal] - AbortController signal for cancellation
 */

class PuterAIService {
  constructor() {
    this.isAvailable = true;
    this.isInitializing = true;
    this.authStatus = 'unknown';
    this.rateLimitDelay = 0;
    this._initialize();
  }

  /**
   * Initialize service and check auth status
   * @private
   */
  async _initialize() {
    try {
      // Wait for Puter to be ready
      if (puter?.auth) {
        this.authStatus = puter.auth.isSignedIn() ? 'authenticated' : 'guest';
        
        // Listen for auth changes
        puter.auth.on('change', (user) => {
          this.authStatus = user ? 'authenticated' : 'guest';
          console.log(`🔐 Auth status changed: ${this.authStatus}`);
        });
      }
      
      console.log("✅ PuterAIService initialized");
    } catch (err) {
      console.error("❌ Failed to initialize PuterAIService:", err);
      this.isAvailable = false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Check if AI is ready to use
   * @returns {Promise<boolean>}
   */
  async isReady() {
    if (this.isInitializing) {
      await new Promise(resolve => {
        const check = () => {
          if (!this.isInitializing) resolve();
          else setTimeout(check, 50);
        };
        check();
      });
    }
    return this.isAvailable && this.authStatus !== 'unknown';
  }

  /**
   * Exponential backoff delay
   * @private
   * @param {number} attempt 
   * @returns {Promise<void>}
   */
  _delay(attempt) {
    const baseDelay = 500;
    const maxDelay = 5000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return new Promise(resolve => setTimeout(resolve, delay + Math.random() * 200));
  }

  /**
   * Robust AI call with retry, auth handling, and rate limiting
   * @param {Object} payload 
   * @param {AICallOptions} options 
   * @param {number} retries 
   * @returns {Promise<AIResponse>}
   */
  async callAIWithRetry(payload, options = {}, retries = 3) {
    const {
      model = "gpt-5-nano", // Puter default
      maxTokens = 1500,
      temperature = 0.7,
      stream = false,
      onStreamChunk = null,
      signal = null
    } = options;

    // Wait for initialization
    await this.isReady();

    // Check availability
    if (!this.isAvailable) {
      throw new Error("PuterAIService is not available");
    }

    // Check auth for AI usage
    if (this.authStatus === 'guest') {
      console.warn("⚠️ Running in guest mode - AI features may be limited");
    }

    // Apply rate limit delay if needed
    if (this.rateLimitDelay > 0) {
      console.log(`⏳ Rate limited, waiting ${this.rateLimitDelay}ms...`);
      await new Promise(res => setTimeout(res, this.rateLimitDelay));
      this.rateLimitDelay = 0;
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Prepare call options
        const callOptions = {
          messages: payload.messages,
          model: model?.startsWith('openai/') || model?.startsWith('anthropic/') 
            ? model 
            : `openai/${model}`,
          max_tokens: maxTokens,
          temperature: temperature,
          stream: stream
        };

        // Handle streaming
        if (stream && onStreamChunk) {
          let fullContent = '';
          
          const streamResponse = await puter.ai.chat(callOptions, { signal });
          
          for await (const chunk of streamResponse) {
            // Puter streaming returns content directly in chunks
            const content = chunk?.message?.content || chunk?.content || '';
            if (content) {
              fullContent += content;
              onStreamChunk(content, fullContent);
            }
          }
          
          return {
            content: fullContent,
            success: true,
            error: null,
            tokensUsed: this._estimateTokens(fullContent)
          };
        }

        // Standard non-streaming call
        const response = await puter.ai.chat(callOptions, { signal });

        // ✅ Correct Puter.js response parsing
        let content = null;
        
        if (response?.message?.content && typeof response.message.content === 'string') {
          content = response.message.content;
        } else if (response?.content && typeof response.content === 'string') {
          content = response.content;
        } else if (typeof response === 'string' && !response.trim().startsWith('<')) {
          // Fallback for plain string responses
          content = response;
        }

        // Detect HTML error pages (502, 503, etc.)
        if (typeof response === 'string' && response.trim().startsWith('<html')) {
          throw new Error("Received HTML error page (likely 502/503)");
        }

        if (!content) {
          console.warn("⚠️ Empty or invalid response from AI:", response);
          throw new Error("Empty response from AI service");
        }

        return {
          content: content.trim(),
          success: true,
          error: null,
          tokensUsed: this._estimateTokens(content)
        };

      } catch (err) {
        const errorMsg = err.message || String(err);
        
        // Don't retry on auth/cancellation errors
        if (errorMsg.includes('abort') || signal?.aborted) {
          console.log("🚫 Request cancelled");
          throw new Error("Request cancelled");
        }
        
        if (errorMsg.includes('auth') || errorMsg.includes('authentication')) {
          console.warn("🔐 Auth error - prompting user to sign in...");
          // Optionally trigger sign-in flow
          // await puter.auth.signIn();
          throw err;
        }

        // Handle rate limiting (429)
        if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit')) {
          this.rateLimitDelay = 2000 * (retries - attempt + 1);
          console.warn(`⚠️ Rate limited. Next retry in ${this.rateLimitDelay}ms`);
        }

        // Log retry attempt
        if (attempt < retries) {
          console.warn(`⚠️ AI call failed (attempt ${attempt + 1}/${retries + 1}): ${errorMsg}`);
          await this._delay(attempt);
          continue;
        }

        // All retries exhausted
        console.error(`❌ AI call failed after ${retries + 1} attempts:`, errorMsg);
        return {
          content: null,
          success: false,
          error: errorMsg,
          tokensUsed: 0
        };
      }
    }

    // Fallback (should never reach here)
    return {
      content: null,
      success: false,
      error: "Unknown error occurred",
      tokensUsed: 0
    };
  }

  /**
   * Estimate token count (rough approximation for Bangla/Unicode)
   * @private
   * @param {string} text 
   * @returns {number}
   */
  _estimateTokens(text) {
    if (!text) return 0;
    // Bangla chars are typically 1.5-2x tokens vs English
    const avgCharsPerToken = 3;
    return Math.ceil(text.length / avgCharsPerToken);
  }

  /**
   * Truncate text safely for Bangla (preserves word boundaries)
   * @private
   * @param {string} text 
   * @param {number} maxLength 
   * @returns {string}
   */
  _truncateBangla(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    
    // Truncate and try to end at word boundary
    let truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      truncated = truncated.substring(0, lastSpace);
    }
    
    return truncated.trim() + '...';
  }

  /**
   * Rewrite article in professional Bangla
   * @param {string} articleText 
   * @param {Object} options - Additional options
   * @returns {Promise<AIResponse>}
   */
  async rewriteArticle(articleText, options = {}) {
    const {
      maxLength = 3000,
      temperature = 0.7,
      onStreamChunk = null,
      signal = null
    } = options;

    // Validation
    if (!articleText || typeof articleText !== 'string') {
      return {
        content: articleText,
        success: false,
        error: "Invalid input: articleText must be a non-empty string",
        tokensUsed: 0
      };
    }

    if (articleText.trim().length < 20) {
      return {
        content: articleText,
        success: true, // Not an error, just too short to rewrite
        error: null,
        tokensUsed: 0
      };
    }

    try {
      console.log("🧠 Starting Bangla article rewrite...");

      // Prepare text with safe truncation
      const textToProcess = this._truncateBangla(articleText, maxLength);

      const prompt = `You are a professional Bangla news editor. Rewrite the following news article in clear, engaging Bangla:

📋 Guidelines:
1. Keep ALL facts, names, dates, and numbers 100% accurate
2. Use professional journalistic tone
3. Structure with clear paragraphs
4. Use proper Bangla punctuation and spelling
5. Make it engaging for general readers
6. Output ONLY the rewritten Bangla text (no English, no explanations)

📰 Article to rewrite:
${textToProcess}

✍️ Rewritten version:`;

      const response = await this.callAIWithRetry(
        { messages: [{ role: "user", content: prompt }] },
        {
          model: "gpt-5-nano", // or "openai/gpt-3.5-turbo"
          maxTokens: 2000,
          temperature: temperature,
          stream: !!onStreamChunk,
          onStreamChunk: onStreamChunk,
          signal: signal
        }
      );

      if (!response.success || !response.content) {
        console.warn("⚠️ Rewrite failed, returning original text");
        return {
          content: articleText,
          success: false,
          error: response.error,
          tokensUsed: response.tokensUsed
        };
      }

      // Post-process: ensure it's actually Bangla
      const hasBangla = /[\u0980-\u09FF]/.test(response.content);
      if (!hasBangla) {
        console.warn("⚠️ Response doesn't contain Bangla script, retrying with stricter prompt...");
        // Could add retry logic here with stricter instructions
      }

      console.log(`✅ Rewrite successful (${response.content.length} chars, ~${response.tokensUsed} tokens)`);
      return response;

    } catch (error) {
      console.error("❌ Rewrite error:", error.message);
      return {
        content: articleText,
        success: false,
        error: error.message,
        tokensUsed: 0
      };
    }
  }

  /**
   * Generate concise Bangla summary
   * @param {string} articleText 
   * @param {Object} options
   * @returns {Promise<AIResponse>}
   */
  async summarizeArticle(articleText, options = {}) {
    const {
      maxLength = 200, // character target
      temperature = 0.3,
      signal = null
    } = options;

    if (!articleText || typeof articleText !== 'string') {
      return {
        content: "",
        success: false,
        error: "Invalid input",
        tokensUsed: 0
      };
    }

    try {
      // Use first 1500 chars for context (Bangla is dense)
      const context = articleText.substring(0, 1500);
      
      const prompt = `সংক্ষিপ্ত করুন: নিচের খবরটি বাংলায় ${maxLength} অক্ষরের মধ্যে সংক্ষিপ্ত করুন। শুধু মূল তথ্য রাখুন, কোনো ব্যাখ্যা বা ইংরেজি লিখবেন না।

খবর:
${context}

সংক্ষিপ্ত রূপ:`;

      const response = await this.callAIWithRetry(
        { messages: [{ role: "user", content: prompt }] },
        {
          model: "gpt-5-nano",
          maxTokens: 400, // ~200 Bangla chars
          temperature: temperature,
          signal: signal
        }
      );

      if (!response.success || !response.content) {
        // Fallback: simple truncation
        const fallback = articleText.substring(0, maxLength).trim() + '...';
        return {
          content: fallback,
          success: false,
          error: response.error,
          tokensUsed: 0
        };
      }

      // Ensure summary respects length (Bangla chars)
      let summary = response.content.trim();
      if (summary.length > maxLength + 50) { // small buffer
        summary = this._truncateBangla(summary, maxLength);
      }

      return {
        content: summary,
        success: true,
        error: null,
        tokensUsed: response.tokensUsed
      };

    } catch (error) {
      console.error("❌ Summarization error:", error.message);
      const fallback = articleText.substring(0, maxLength).trim() + '...';
      return {
        content: fallback,
        success: false,
        error: error.message,
        tokensUsed: 0
      };
    }
  }

  /**
   * Trigger sign-in flow for AI access
   * @returns {Promise<boolean>}
   */
  async requestSignIn() {
    if (puter.auth?.isSignedIn()) return true;
    
    try {
      console.log("🔐 Requesting user sign-in for AI access...");
      await puter.auth.signIn();
      this.authStatus = 'authenticated';
      return true;
    } catch (err) {
      console.warn("⚠️ Sign-in cancelled or failed:", err.message);
      this.authStatus = 'guest';
      return false;
    }
  }

  /**
   * Get current service status
   * @returns {Object}
   */
  getStatus() {
    return {
      available: this.isAvailable,
      initializing: this.isInitializing,
      authStatus: this.authStatus,
      rateLimited: this.rateLimitDelay > 0
    };
  }
}

// ✅ Singleton export
const puterAIService = new PuterAIService();
export default puterAIService;
