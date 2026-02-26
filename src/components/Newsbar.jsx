import React, { useState, useEffect } from "react";
import "./newsbar.css";
import { Link } from "react-router-dom";

const Newsbar = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("https://news-project-06582.onrender.com/news/all")
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => setNews(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch news");
      });
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!news.length) return <h2 className="loading">Loading latest news...</h2>;

  const visibleNews = showAll ? news : news.slice(0, 5);

  return (
    <div className="news-wrapper">
      <div className="news-container">
        {visibleNews.map((article) => (
          <div key={article._id || article.id} className="news-card">
            <div className="image-wrapper">
              <img src={article.image} alt={article.title} />
              <div className="overlay" />
            </div>

            <div className="news-content">
              <Link to={`/article/${article.id || article._id}`}>
                <h3>{article.title}</h3>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="see-more-container">
        {!showAll && news.length > 5 && (
          <button
            className="see-more-btn"
            onClick={() => setShowAll(true)}
          >
            See More News →
          </button>
        )}

        {showAll && (
          <button
            className="see-less-btn"
            onClick={() => setShowAll(false)}
          >
            ← See Less
          </button>
        )}
      </div>
    </div>
  );
};

export default Newsbar;
