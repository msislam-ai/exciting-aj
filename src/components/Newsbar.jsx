// src/components/Newsbar.jsx
import React, { useState, useEffect } from "react";
import "./newsbar.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Newsbar = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Normalize categories (optional if needed)
  const normalizeCategory = (cat) => {
    const c = (cat || "").toLowerCase().trim();
    if (c.includes("national") || c.includes("জাতীয়")) return "জাতীয়";
    if (c.includes("politics") || c.includes("রাজনীতি")) return "রাজনীতি";
    if (c.includes("sports") || c.includes("খেলা")) return "খেলা";
    if (c.includes("international") || c.includes("আন্তর্জাতিক")) return "আন্তর্জাতিক";
    return "আরও";
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      // ✅ Fetch all news (or high limit) to get latest ones
      const res = await axios.get(
        `https://news-project-06582-2.onrender.com/news/all?page=1&limit=1000&_=${Date.now()}`
      );

      let articles = Array.isArray(res.data.data) ? res.data.data : res.data || [];

      // ✅ Sort by latest pubDate
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      // ✅ Take last 5 articles (latest)
      const latestArticles = articles.slice(-5).reverse(); // reverse to show newest first

      // ✅ Normalize categories
      const cleaned = latestArticles.map((item) => ({
        ...item,
        category: normalizeCategory(item.category),
      }));

      setNews(cleaned);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();

    // ✅ Auto-refresh every 30s
    const interval = setInterval(() => loadNews(), 7200000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );

  if (error) return <p className="status-text error">{error}</p>;
  if (!news.length) return <p className="status-text">No news available.</p>;

  return (
    <div className="news-wrapper">
      <div className="news-container">
        {news.map((article) => (
          <div key={article._id || article.id} className="news-card">
            <div className="image-wrapper">
              <img src={article.image || "/placeholder.jpg"} alt={article.title} />
              <div className="overlay" />
            </div>

            <div className="news-content">
              <Link to={`/article/${article._id || article.id}`}>
                <h3>{article.title}</h3>
              </Link>
              <span className="category">{article.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      <div className="see-more-container">
        <button className="see-more-btn" onClick={() => navigate("/AllNewsPage")}>
          See More News →
        </button>
      </div>
    </div>
  );
};

export default Newsbar;
