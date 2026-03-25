// ArticlePage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllNews } from "./newsApi";

// 🎨 Loading Spinner
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

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
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

  if (loading) {
    return (
      <section style={{ padding: "50px 8%", textAlign: "center" }}>
        <LoadingSpinner size="40px" />
        <p style={{ marginTop: "16px", color: "#666" }}>Loading article...</p>
      </section>
    );
  }

  if (error || !article) {
    return (
      <section style={{ padding: "50px 8%" }}>
        <Link to="/" style={{ marginBottom: "20px", display: "inline-block" }}>← Back to Home</Link>
        <p style={{ color: "#e63946", fontSize: "18px" }}>❌ {error || "Article not found"}</p>
      </section>
    );
  }

  return (
    <section style={{ padding: "40px 8%", fontFamily: "Segoe UI, system-ui, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <Link 
        to="/" 
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px", color: "#1d3557", textDecoration: "none", fontWeight: "500" }}
      >
        ← Back to Home
      </Link>

      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", lineHeight: "1.4", marginBottom: "12px", color: "#1d3557" }}>
          {article.title}
        </h1>
        {article.category && (
          <span style={{ display: "inline-block", padding: "4px 12px", background: "#a8dadc", color: "#1d3557", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
            {article.category}
          </span>
        )}
      </header>

      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          style={{ width: "100%", height: "auto", maxHeight: "400px", objectFit: "cover", borderRadius: "12px", margin: "20px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          onError={(e) => e.target.style.display = 'none'}
        />
      )}

      <article style={{ fontSize: "17px", lineHeight: "1.9", color: "#333", textAlign: "justify" }}>
        {(article.content || article.description || "No content available.").split("\n").map((line, idx) => (
          <p key={idx} style={{ marginBottom: "18px" }}>{line}</p>
        ))}
      </article>

      <footer style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e9ecef", color: "#666", fontSize: "14px" }}>
        <p>Published: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('bn-BD') : 'N/A'}</p>
      </footer>
    </section>
  );
};

export default ArticlePage;
