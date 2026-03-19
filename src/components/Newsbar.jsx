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

  const normalizeCategory = (cat) => {
    const c = (cat || "").toLowerCase().trim();
    if (c.includes("national") || c.includes("জাতীয়")) return "জাতীয়";
    if (c.includes("politics") || c.includes("রাজনীতি")) return "রাজনীতি";
    if (c.includes("sports") || c.includes("খেলা")) return "খেলা";
    if (c.includes("international") || c.includes("আন্তর্জাতিক")) return "আন্তর্জাতিক";
    return "আরও";
  };

  const loadLatestNews = async () => {
    setLoading(true);
    try {
      // Fetch a reasonable amount of news (e.g., 50) to sort locally
      const res = await axios.get(
        "https://news-project-06582-2.onrender.com/news/all?page=1&limit=50&_=" + Date.now()
      );

      const articles = Array.isArray(res.data.data) ? res.data.data : [];

      // Sort by pubDate descending (latest first)
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      // Take first 5 as latest
      const latestArticles = articles.slice(0, 5).map((item) => ({
        ...item,
        category: normalizeCategory(item.category),
      }));

      setNews(latestArticles);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestNews();

    // Refresh every 3 hours
    const interval = setInterval(loadLatestNews, 3 * 60 * 60 * 1000);
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

      <div className="see-more-container">
        <button className="see-more-btn" onClick={() => navigate("/AllNewsPage")}>
          See More News →
        </button>
      </div>
    </div>
  );
};

export default Newsbar;
