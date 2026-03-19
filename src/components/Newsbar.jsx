import React, { useState, useEffect } from "react";
import "./newsbar.css";
import { Link, useNavigate } from "react-router-dom";

const Newsbar = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://news-project-06582-2.onrender.com/news/all?page=1&limit=5") // show top 5 on homepage
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => setNews(data.data || data))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch news");
      });
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!news.length) return <h2 className="loading">Loading latest news...</h2>;

  return (
    <div className="news-wrapper">
      <div className="news-container">
        {news.map((article) => (
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
