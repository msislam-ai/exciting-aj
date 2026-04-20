import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

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
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const BASE_URL = "https://banglabartaa.news.girlneed.com";

const ArticlePage = () => {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        let foundArticle = null;

        // ===============================
        // STEP 1: Try single article API
        // ===============================
        try {
          const res = await axios.get(`${BASE_URL}/news/${id}`, {
            timeout: 8000,
          });

          const data = res?.data?.data || res?.data;

          if (data) {
            foundArticle = data;
          }
        } catch (err) {
          console.warn("Single API failed, using fallback...");
        }

        // ===============================
        // STEP 2: Fallback (load all news)
        // ===============================
        if (!foundArticle) {
          const res = await axios.get(
            `${BASE_URL}/news/all?page=1&limit=500`,
            { timeout: 10000 }
          );

          const allNews =
            res?.data?.data ||
            res?.data?.news ||
            res?.data ||
            [];

          if (!Array.isArray(allNews)) {
            throw new Error("Invalid API format");
          }

          foundArticle = allNews.find((item) => {
            return (
              item?._id?.toString() === id ||
              item?.id?.toString() === id
            );
          });
        }

        // ===============================
        // STEP 3: Final check
        // ===============================
        if (!foundArticle) {
          throw new Error("Article not found");
        }

        setArticle(foundArticle);
      } catch (err) {
        console.error("Article load error:", err);
        setError(err.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <section style={{ padding: "50px 8%", textAlign: "center" }}>
        <LoadingSpinner size="40px" />
        <p style={{ marginTop: "16px", color: "#666" }}>
          Loading article...
        </p>
      </section>
    );
  }

  /* ================= ERROR ================= */
  if (error || !article) {
    return (
      <section style={{ padding: "50px 8%" }}>
        <Link
          to="/"
          style={{ marginBottom: "20px", display: "inline-block" }}
        >
          ← Back to Home
        </Link>

        <p style={{ color: "#e63946", fontSize: "18px" }}>
          ❌ {error || "Article not found"}
        </p>
      </section>
    );
  }

  /* ================= UI ================= */
  return (
    <section
      style={{
        padding: "40px 8%",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Back */}
      <Link
        to="/"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#1d3557",
          textDecoration: "none",
          fontWeight: "500",
        }}
      >
        ← Back to Home
      </Link>

      {/* Title */}
      <h1 style={{ fontSize: "28px", color: "#1d3557" }}>
        {article?.title || "No Title"}
      </h1>

      {/* Category */}
      {article?.category && (
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            background: "#a8dadc",
            borderRadius: "20px",
            marginTop: "10px",
          }}
        >
          {article.category}
        </span>
      )}

      {/* Image */}
      {article?.image && (
        <img
          src={article.image}
          alt={article.title}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "10px",
            marginTop: "20px",
          }}
          onError={(e) => (e.target.style.display = "none")}
        />
      )}

      {/* Content */}
      <article
        style={{
          marginTop: "20px",
          fontSize: "17px",
          lineHeight: "1.8",
          color: "#333",
        }}
      >
        {(article?.content ||
          article?.description ||
          "No content available.")
          .toString()
          .split("\n")
          .map((line, i) => (
            <p key={i} style={{ marginBottom: "15px" }}>
              {line}
            </p>
          ))}
      </article>

      {/* Date */}
      <footer
        style={{
          marginTop: "40px",
          fontSize: "14px",
          color: "#666",
          borderTop: "1px solid #eee",
          paddingTop: "15px",
        }}
      >
        Published:{" "}
        {article?.publishedAt || article?.pubDate
          ? new Date(
              article.publishedAt || article.pubDate
            ).toLocaleDateString("bn-BD")
          : "N/A"}
      </footer>
    </section>
  );
};

export default ArticlePage;
