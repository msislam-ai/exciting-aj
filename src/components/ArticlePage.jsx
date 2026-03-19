// src/components/ArticlePage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://news-project-06582-2.onrender.com/news/${id}`
        );
        if (!res.ok) throw new Error("Article not found");
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  if (loading)
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}></div>
        <p>Loading article...</p>
      </div>
    );

  if (error)
    return (
      <div style={styles.errorWrapper}>
        <p>{error}</p>
        <Link to="/" style={styles.backBtn}>
          ← Back to Home
        </Link>
      </div>
    );

  if (!article) return null;

  return (
    <section style={styles.container}>
      <Link to="/" style={styles.backBtn}>
        ← Back to Home
      </Link>

      <h1 style={styles.title}>{article.title}</h1>

      <span style={styles.category}>{article.category || "আরও"}</span>

      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          style={styles.image}
        />
      )}

      <div style={styles.content}>
        {article.content
          ? article.content.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))
          : <p>{article.shortDescription || "No content available."}</p>}
      </div>
    </section>
  );
};

// Inline styles for simplicity
const styles = {
  container: {
    padding: "50px 8%",
    fontFamily: "Segoe UI, sans-serif",
    maxWidth: "900px",
    margin: "0 auto",
  },
  backBtn: {
    display: "inline-block",
    marginBottom: "20px",
    textDecoration: "none",
    color: "#e63946",
    fontWeight: 500,
  },
  title: {
    marginBottom: "10px",
    fontSize: "2.2rem",
    fontWeight: 700,
  },
  category: {
    color: "#e63946",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  image: {
    width: "100%",
    margin: "20px 0",
    borderRadius: "10px",
    objectFit: "cover",
  },
  content: {
    fontSize: "1.1rem",
    lineHeight: 1.8,
  },
  loadingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "15px",
    fontSize: "1.1rem",
    color: "#555",
  },
  spinner: {
    border: "6px solid #f3f3f3",
    borderTop: "6px solid #e63946",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
  },
  errorWrapper: {
    padding: "50px 8%",
    textAlign: "center",
    color: "red",
  },
};

// Add spinner animation keyframes
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`, styleSheet.cssRules.length);

export default ArticlePage;
