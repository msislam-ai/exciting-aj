// src/components/Newsbar.jsx
import React, { useState, useEffect } from "react";
import "./newsbar.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Newsbar = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      // ✅ Fetch only 5 latest news, smallest payload
      const res = await axios.get(
        `https://news-project-06582-2.onrender.com/news/all?page=1&limit=5&sort=latest&_=${Date.now()}`,
        { params: { fields: "_id,title,image,category,pubDate" } } // fetch only needed fields
      );

      const articles = Array.isArray(res.data.data) ? res.data.data : [];
      setNews(
        articles.map((item) => ({
          ...item,
          category: normalizeCategory(item.category),
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestNews();

    // Refresh every 3 hours (10800000 ms)
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
