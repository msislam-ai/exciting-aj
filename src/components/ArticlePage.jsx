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

        // ✅ STEP 1: Try direct API (best case)
        try {
          const res = await axios.get(`${BASE_URL}/news/${id}`, {
            timeout: 8000,
          });

          const data = res?.data?.data || res?.data;
          if (data) foundArticle = data;
        } catch (err) {
          console.warn("Direct API failed, fallback to list API...");
        }

        // ✅ STEP 2: Fallback (get all news)
        if (!foundArticle) {
          const res = await axios.get(
            `${BASE_URL}/news/all?page=1&limit=500`,
            { timeout: 10000 }
          );

          const allNews =
            res?.data?.data ||
            res?.data?.articles ||
            res?.data ||
            [];

          foundArticle = allNews.find(
            (item) =>
              item._id?.toString() === id ||
              item.id?.toString() === id
          );
        }

        if (!foundArticle) {
          throw new Error("Article not found");
        }

        setArticle(foundArticle);
      } catch (err) {
        console.error(err);
        setError("Article not found or failed to load");
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
        <Link to="/" style={{ marginBottom: "20px", display: "inline-block" }}>
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
        fontFamily: "Segoe UI, system-ui, sans-serif",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "24px",
          color: "#1d3557",
          textDecoration: "none",
          fontWeight: "500",
        }}
      >
        ← Back to Home
      </Link>

      {/* TITLE */}
      <h1
        style={{
          fontSize: "28px",
          lineHeight: "1.4",
          marginBottom: "12px",
          color: "#1d3557",
        }}
      >
        {article?.title || "No Title"}
      </h1>

      {/* CATEGORY */}
      {article?.category && (
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            background: "#a8dadc",
            color: "#1d3557",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "15px",
          }}
        >
          {article.category}
        </span>
      )}

      {/* IMAGE */}
      {article?.image && (
        <img
          src={article.image}
          alt={article.title}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "12px",
            margin: "20px 0",
          }}
          onError={(e) => (e.target.style.display = "none")}
        />
      )}

      {/* CONTENT */}
      <article
        style={{
          fontSize: "17px",
          lineHeight: "1.9",
          color: "#333",
          textAlign: "justify",
        }}
      >
        {(article?.content ||
          article?.description ||
          "No content available.")
          .toString()
          .split("\n")
          .map((line, i) => (
            <p key={i} style={{ marginBottom: "16px" }}>
              {line}
            </p>
          ))}
      </article>

      {/* DATE */}
      <footer
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid #eee",
          fontSize: "14px",
          color: "#666",
        }}
      >
        Published:{" "}
        {article?.publishedAt || article?.pubDate
          ? new Date(article.publishedAt || article.pubDate).toLocaleDateString(
              "bn-BD"
            )
          : "N/A"}
      </footer>
    </section>
  );
};

export default ArticlePage;    </section>
  );
};

export default ArticlePage;
