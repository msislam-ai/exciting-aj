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

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        // Fetch all news (or a large number)
        const res = await axios.get(
          "https://news-project-06582-2.onrender.com/news/all?page=1&limit=1000"
        );

        let articles = Array.isArray(res.data.data) ? res.data.data : res.data || [];

        // Take the last 5 items for latest news
        articles = articles.slice(-5);

        setNews(articles);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading)
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  if (error) return <p className="error">{error}</p>;
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
