// ArticlePage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { fetchAllNews } from "./newsApi";
import puterAIService from "./aiService.js"; // ✅ Import our AI service

// 🎨 Reusable Loading Spinner
const LoadingSpinner = ({ size = "20px", color = "#1d3557" }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}20`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// 🎨 AI Action Button Component
const AIActionButton = ({ onClick, disabled, loading, children, variant = "primary" }) => {
  const variants = {
    primary: { bg: "#1d3557", hover: "#457b9d", text: "#fff" },
    secondary: { bg: "#f1faee", hover: "#a8dadc", text: "#1d3557" },
    danger: { bg: "#e63946", hover: "#c1121f", text: "#fff" },
  };
  const style = variants[variant] || variants.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 20px",
        background: style.bg,
        color: style.text,
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.7 : 1,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = style.hover;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = style.bg;
      }}
    >
      {loading && <LoadingSpinner size="16px" color={style.text} />}
      {children}
    </button>
  );
};

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🤖 AI States
  const [aiRewriting, setAiRewriting] = useState(false);
  const [aiSummarizing, setAiSummarizing] = useState(false);
  const [rewrittenContent, setRewrittenContent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [showRewrite, setShowRewrite] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);

  // 🔄 AbortController for cancellation
  const aiAbortRef = useRef(null);

  // 📝 Load article data
  useEffect(() => {
    const loadArticle = async () => {
      try {
        const res = await fetchAllNews(1, 1000);
        const allNews = res.data || [];
        const selected = allNews.find(
          (item) => item.id?.toString() === id || item._id?.toString() === id
        );
        if (!selected) throw new Error("Article not found");
        setArticle(selected);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  // 🧹 Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiAbortRef.current) {
        aiAbortRef.current.abort();
      }
    };
  }, []);

  // ✅ Check AI readiness & handle auth
  const ensureAIReady = async () => {
    setAiError(null);
    setAuthPrompt(false);

    const ready = await puterAIService.isReady();
    if (!ready) {
      const status = puterAIService.getStatus();
      if (status.authStatus === 'guest') {
        setAuthPrompt(true);
        return false;
      }
      if (!status.available) {
        setAiError("AI service is currently unavailable.");
        return false;
      }
    }
    return true;
  };

  // 🔄 Handle AI sign-in
  const handleAISignIn = async () => {
    const signedIn = await puterAIService.requestSignIn();
    if (signedIn) {
      setAuthPrompt(false);
      return true;
    }
    setAiError("Sign-in required for AI features. Please try again.");
    return false;
  };

  // ✍️ Rewrite Article Handler
  const handleRewrite = useCallback(async () => {
    if (!await ensureAIReady()) return;
    
    // Cancel previous request
    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
    }
    aiAbortRef.current = new AbortController();

    setAiRewriting(true);
    setAiError(null);
    setShowRewrite(true);
    setRewrittenContent(null);

    try {
      const result = await puterAIService.rewriteArticle(article.content || article.shortDescription, {
        temperature: 0.7,
        // 🌊 Streaming callback for real-time UI
        onStreamChunk: (chunk, fullText) => {
          setRewrittenContent(fullText);
        },
        signal: aiAbortRef.current.signal
      });

      if (result.success && result.content) {
        setRewrittenContent(result.content);
        console.log(`✅ Rewrite complete: ~${result.tokensUsed} tokens used`);
      } else {
        throw new Error(result.error || "Rewrite failed");
      }
    } catch (err) {
      if (err.message === "Request cancelled") {
        console.log("🚫 Rewrite cancelled");
        setAiError(null);
        return;
      }
      console.error("❌ Rewrite error:", err);
      setAiError(err.message || "Failed to rewrite article");
      setShowRewrite(false);
    } finally {
      setAiRewriting(false);
    }
  }, [article]);

  // 📰 Summarize Article Handler
  const handleSummarize = useCallback(async () => {
    if (!await ensureAIReady()) return;

    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
    }
    aiAbortRef.current = new AbortController();

    setAiSummarizing(true);
    setAiError(null);
    setShowSummary(true);
    setSummary(null);

    try {
      const result = await puterAIService.summarizeArticle(
        article.content || article.shortDescription,
        {
          maxLength: 250,
          temperature: 0.3,
          signal: aiAbortRef.current.signal
        }
      );

      if (result.success && result.content) {
        setSummary(result.content);
      } else {
        throw new Error(result.error || "Summarization failed");
      }
    } catch (err) {
      if (err.message === "Request cancelled") return;
      console.error("❌ Summary error:", err);
      setAiError(err.message || "Failed to summarize");
      setShowSummary(false);
    } finally {
      setAiSummarizing(false);
    }
  }, [article]);

  // 🔄 Replace original with rewritten content
  const handleReplaceContent = () => {
    if (rewrittenContent) {
      setArticle(prev => ({ ...prev, content: rewrittenContent }));
      setShowRewrite(false);
      setRewrittenContent(null);
    }
  };

  // 🚫 Cancel AI operation
  const handleCancelAI = () => {
    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
      aiAbortRef.current = null;
    }
    setAiRewriting(false);
    setAiSummarizing(false);
    setAiError("Operation cancelled");
  };

  // 🎨 Render loading state
  if (loading) {
    return (
      <section style={{ padding: "50px 8%", textAlign: "center" }}>
        <LoadingSpinner size="40px" />
        <p style={{ marginTop: "16px", color: "#666" }}>Loading article...</p>
      </section>
    );
  }

  // 🎨 Render error state
  if (error) {
    return (
      <section style={{ padding: "50px 8%" }}>
        <Link to="/" style={{ marginBottom: "20px", display: "inline-block" }}>← Back to Home</Link>
        <p style={{ color: "#e63946", fontSize: "18px" }}>❌ {error}</p>
      </section>
    );
  }

  if (!article) {
    return (
      <section style={{ padding: "50px 8%" }}>
        <Link to="/" style={{ marginBottom: "20px", display: "inline-block" }}>← Back to Home</Link>
        <p>Article not found!</p>
      </section>
    );
  }

  // 🎨 Main Article Render
  return (
    <section style={{ 
      padding: "40px 8%", 
      fontFamily: "Segoe UI, system-ui, sans-serif",
      maxWidth: "900px",
      margin: "0 auto"
    }}>
      {/* 🔙 Back Link */}
      <Link 
        to="/" 
        style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "6px",
          marginBottom: "24px",
          color: "#1d3557",
          textDecoration: "none",
          fontWeight: "500"
        }}
      >
        ← Back to Home
      </Link>

      {/* 📰 Article Header */}
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ 
          fontSize: "28px", 
          lineHeight: "1.4", 
          marginBottom: "12px",
          color: "#1d3557"
        }}>
          {article.title}
        </h1>
        
        {article.category && (
          <span style={{ 
            display: "inline-block",
            padding: "4px 12px",
            background: "#a8dadc",
            color: "#1d3557",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600"
          }}>
            {article.category}
          </span>
        )}
      </header>

      {/* 🖼️ Article Image */}
      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "12px",
            margin: "20px 0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* 🤖 AI Action Bar */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "12px", 
        margin: "24px 0",
        padding: "16px",
        background: "#f8f9fa",
        borderRadius: "12px",
        border: "1px solid #e9ecef"
      }}>
        <AIActionButton
          onClick={handleRewrite}
          disabled={aiRewriting || aiSummarizing || !article.content}
          loading={aiRewriting}
          variant="primary"
        >
          {aiRewriting ? "Rewriting..." : "✨ Rewrite in Bangla"}
        </AIActionButton>

        <AIActionButton
          onClick={handleSummarize}
          disabled={aiRewriting || aiSummarizing || !article.content}
          loading={aiSummarizing}
          variant="secondary"
        >
          {aiSummarizing ? "Summarizing..." : "📰 Quick Summary"}
        </AIActionButton>

        {(aiRewriting || aiSummarizing) && (
          <AIActionButton
            onClick={handleCancelAI}
            variant="danger"
          >
            🚫 Cancel
          </AIActionButton>
        )}
      </div>

      {/* ⚠️ Auth Prompt */}
      {authPrompt && (
        <div style={{
          padding: "16px",
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <span style={{ color: "#856404", fontSize: "14px" }}>
            🔐 AI features require sign-in. Get better results with a free account!
          </span>
          <button
            onClick={handleAISignIn}
            style={{
              padding: "8px 16px",
              background: "#1d3557",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Sign In to Use AI
          </button>
        </div>
      )}

      {/* ❌ AI Error Display */}
      {aiError && (
        <div style={{
          padding: "12px 16px",
          background: "#f8d7da",
          border: "1px solid #f5c6cb",
          color: "#721c24",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>⚠️ {aiError}</span>
          <button 
            onClick={() => setAiError(null)}
            style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#721c24" }}
          >
            ×
          </button>
        </div>
      )}

      {/* 📝 Summary Panel */}
      {showSummary && summary && (
        <div style={{
          padding: "20px",
          background: "#e9ecef",
          borderRadius: "12px",
          marginBottom: "24px",
          borderLeft: "4px solid #1d3557"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "12px"
          }}>
            <strong style={{ color: "#1d3557" }}>📰 Quick Summary</strong>
            <button
              onClick={() => { setShowSummary(false); setSummary(null); }}
              style={{ 
                background: "none", 
                border: "none", 
                color: "#666", 
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              ×
            </button>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: "16px", 
            lineHeight: "1.6",
            color: "#333"
          }}>
            {summary}
          </p>
        </div>
      )}

      {/* ✍️ Rewritten Content Panel */}
      {showRewrite && rewrittenContent && (
        <div style={{
          padding: "20px",
          background: "#f1faee",
          borderRadius: "12px",
          marginBottom: "24px",
          border: "2px solid #457b9d"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <strong style={{ color: "#1d3557" }}>✨ AI-Rewritten Version</strong>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleReplaceContent}
                style={{
                  padding: "6px 14px",
                  background: "#1d3557",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                ✓ Replace Original
              </button>
              <button
                onClick={() => { setShowRewrite(false); setRewrittenContent(null); }}
                style={{
                  padding: "6px 14px",
                  background: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                ✕ Keep Original
              </button>
            </div>
          </div>
          <div style={{ 
            fontSize: "16px", 
            lineHeight: "1.8", 
            color: "#333",
            whiteSpace: "pre-wrap"
          }}>
            {rewrittenContent.split("\n").map((line, index) => (
              <p key={index} style={{ margin: "0 0 16px 0" }}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* 📄 Original Article Content */}
      <article style={{ 
        fontSize: "17px", 
        lineHeight: "1.9", 
        color: "#333",
        textAlign: "justify"
      }}>
        {(showRewrite && rewrittenContent) ? null : (
          article.content ? (
            article.content.split("\n").map((line, index) => (
              <p key={index} style={{ marginBottom: "18px" }}>
                {line}
              </p>
            ))
          ) : (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              {article.shortDescription || "No content available."}
            </p>
          )
        )}
      </article>

      {/* 🦶 Footer */}
      <footer style={{ 
        marginTop: "40px", 
        paddingTop: "20px", 
        borderTop: "1px solid #e9ecef",
        color: "#666",
        fontSize: "14px"
      }}>
        <p>Published: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('bn-BD') : 'N/A'}</p>
      </footer>
    </section>
  );
};

export default ArticlePage;
