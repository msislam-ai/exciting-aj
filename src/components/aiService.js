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

  async _initialize() {
    try {
      if (puter?.auth) {
        this.authStatus = puter.auth.isSignedIn() ? 'authenticated' : 'guest';
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

  _delay(attempt) {
    const baseDelay = 500;
    const maxDelay = 5000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return new Promise(resolve => setTimeout(resolve, delay + Math.random() * 200));
  }

  async callAIWithRetry(payload, options = {}, retries = 3) {
    const {
      model = "gpt-5-nano",
      maxTokens = 1500,
      temperature = 0.7,
      stream = false,
      onStreamChunk = null,
      signal = null
    } = options;

    await this.isReady();

    if (!this.isAvailable) {
      throw new Error("PuterAIService is not available");
    }

    if (this.authStatus === 'guest') {
      console.warn("⚠️ Running in guest mode - AI features may be limited");
    }

    if (this.rateLimitDelay > 0) {
      console.log(`⏳ Rate limited, waiting ${this.rateLimitDelay}ms...`);
      await new Promise(res => setTimeout(res, this.rateLimitDelay));
      this.rateLimitDelay = 0;
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const callOptions = {
          messages: payload.messages,
          model: model?.startsWith('openai/') || model?.startsWith('anthropic/') 
            ? model 
            : `openai/${model}`,
          max_tokens: maxTokens,
          temperature: temperature,
          stream: stream
        };

        if (stream && onStreamChunk) {
          let fullContent = '';
          const streamResponse = await puter.ai.chat(callOptions, { signal });
          for await (const chunk of streamResponse) {
            const content = chunk?.message?.content || chunk?.content || '';
            if (content) {
              fullContent += content;
              onStreamChunk(content, fullContent);
            }
          }
          return { content: fullContent, success: true, error: null, tokensUsed: this._estimateTokens(fullContent) };
        }

        const response = await puter.ai.chat(callOptions, { signal });
        let content = null;
        if (response?.message?.content) content = response.message.content;
        else if (response?.content) content = response.content;
        else if (typeof response === 'string' && !response.trim().startsWith('<')) content = response;
        if (!content) throw new Error("Empty response from AI service");

        return { content: content.trim(), success: true, error: null, tokensUsed: this._estimateTokens(content) };

      } catch (err) {
        const errorMsg = err.message || String(err);
        if (errorMsg.includes('abort') || signal?.aborted) throw new Error("Request cancelled");
        if (errorMsg.includes('auth') || errorMsg.includes('authentication')) throw err;
        if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit')) {
          this.rateLimitDelay = 2000 * (retries - attempt + 1);
          console.warn(`⚠️ Rate limited. Next retry in ${this.rateLimitDelay}ms`);
        }
        if (attempt < retries) {
          console.warn(`⚠️ AI call failed (attempt ${attempt + 1}/${retries + 1}): ${errorMsg}`);
          await this._delay(attempt);
          continue;
        }
        console.error(`❌ AI call failed after ${retries + 1} attempts:`, errorMsg);
        return { content: null, success: false, error: errorMsg, tokensUsed: 0 };
      }
    }

    return { content: null, success: false, error: "Unknown error occurred", tokensUsed: 0 };
  }

  _estimateTokens(text) {
    if (!text) return 0;
    const avgCharsPerToken = 3;
    return Math.ceil(text.length / avgCharsPerToken);
  }

  _truncateBangla(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    let truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) truncated = truncated.substring(0, lastSpace);
    return truncated.trim() + '...';
  }

  async rewriteArticle(articleText, options = {}) {
    const { maxLength = 3000, temperature = 0.7, onStreamChunk = null, signal = null } = options;
    if (!articleText || typeof articleText !== 'string') return { content: articleText, success: false, error: "Invalid input", tokensUsed: 0 };
    if (articleText.trim().length < 20) return { content: articleText, success: true, error: null, tokensUsed: 0 };

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
      { model: "gpt-5-nano", maxTokens: 2000, temperature: temperature, stream: !!onStreamChunk, onStreamChunk, signal }
    );

    if (!response.success || !response.content) return { content: articleText, success: false, error: response.error, tokensUsed: response.tokensUsed };
    return response;
  }

  async summarizeArticle(articleText, options = {}) {
    const { maxLength = 200, temperature = 0.3, signal = null } = options;
    if (!articleText || typeof articleText !== 'string') return { content: "", success: false, error: "Invalid input", tokensUsed: 0 };

    const context = articleText.substring(0, 1500);
    const prompt = `সংক্ষিপ্ত করুন: নিচের খবরটি বাংলায় ${maxLength} অক্ষরের মধ্যে সংক্ষিপ্ত করুন। শুধু মূল তথ্য রাখুন, কোনো ব্যাখ্যা বা ইংরেজি লিখবেন না।

খবর:
${context}

সংক্ষিপ্ত রূপ:`;

    const response = await this.callAIWithRetry(
      { messages: [{ role: "user", content: prompt }] },
      { model: "gpt-5-nano", maxTokens: 400, temperature: temperature, signal }
    );

    if (!response.success || !response.content) {
      const fallback = articleText.substring(0, maxLength).trim() + '...';
      return { content: fallback, success: false, error: response.error, tokensUsed: 0 };
    }

    let summary = response.content.trim();
    if (summary.length > maxLength + 50) summary = this._truncateBangla(summary, maxLength);

    return { content: summary, success: true, error: null, tokensUsed: response.tokensUsed };
  }

  async generateContent(shortDescription) {
    if (!shortDescription) return { text: "" };
    const prompt = `নিচের সংক্ষিপ্ত বর্ণনার উপর ভিত্তি করে একটি সম্পূর্ণ প্রবন্ধ লিখুন বাংলায়, তথ্যবহুল এবং আকর্ষণীয়ভাবে:

সংক্ষিপ্ত বিবরণ:
${shortDescription}

সম্পূর্ণ প্রবন্ধ:`;

    const response = await this.callAIWithRetry(
      { messages: [{ role: "user", content: prompt }] },
      { model: "gpt-5-nano", maxTokens: 2000, temperature: 0.7 }
    );

    return { text: response.content || shortDescription };
  }

  async requestSignIn() {
    if (puter.auth?.isSignedIn()) return true;
    try {
      await puter.auth.signIn();
      this.authStatus = 'authenticated';
      return true;
    } catch (err) {
      this.authStatus = 'guest';
      return false;
    }
  }

  getStatus() {
    return {
      available: this.isAvailable,
      initializing: this.isInitializing,
      authStatus: this.authStatus,
      rateLimited: this.rateLimitDelay > 0
    };
  }
}

const puterAIService = new PuterAIService();
export default puterAIService;
