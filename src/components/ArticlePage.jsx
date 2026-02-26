// src/components/ArticlePage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllNews } from "./newsApi"; // make sure this points to your API file

const ArticlePage = () => {
  const { id } = useParams(); // get article ID from URL
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const allNews = await fetchAllNews();

        // Find the article by id or _id
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

  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  if (!article) return <p style={{ padding: "20px" }}>Article not found!</p>;

  return (
    <section style={{ padding: "50px 8%", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Back link */}
      <Link to="/" style={{ display: "inline-block", marginBottom: "20px" }}>
        ← Back to Home
      </Link>

      {/* Title */}
      <h1 style={{ marginBottom: "20px", fontSize: "32px" }}>{article.title}</h1>

      {/* Category */}
      <span style={{ color: "#e63946", fontWeight: "600", fontSize: "14px" }}>
        {article.category || "আরও"}
      </span>

      {/* Image */}
      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          style={{
            width: "100%",
            margin: "20px 0",
            borderRadius: "10px",
            objectFit: "cover",
          }}
        />
      )}

      {/* Full Content */}
      <div style={{ fontSize: "18px", lineHeight: "1.8", marginBottom: "20px" }}>
        {article.content ? (
          article.content.split("\n").map((line, index) => (
            <p key={index} style={{ marginBottom: "16px" }}>
              {line}
            </p>
          ))
        ) : (
          <p>{article.shortDescription || "No content available."}</p>
        )}
      </div>
    </section>
  );
};

export default ArticlePage;