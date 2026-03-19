// src/components/Newsbar.jsx
import React, { useState, useEffect } from "react";
import "./newsbar.css";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllNews } from "./newsApi"; // connect to your API

const Newsbar = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNews = async () => {
      try {
        // Fetch first page with 5 articles
        const data = await fetchAllNews(1, 5);
        const articles = data.data || []; // ✅ make sure it's an array
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

  if (loading) return <h2 className="loading">Loading latest news...</h2>;
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
        <button
          className="see-more-btn"
          onClick={() => navigate("/all-news")}
        >
          See More News →
        </button>
      </div>
    </div>
  );
};

export default Newsbar;
