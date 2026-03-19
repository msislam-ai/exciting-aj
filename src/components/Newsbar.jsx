import React, { useState, useEffect } from "react";
import "./newsbar.css";
import { Link } from "react-router-dom";

const Newsbar = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // current page
  const [limit] = useState(5); // items per page
  const [hasMore, setHasMore] = useState(true); // whether more pages exist
  const [loading, setLoading] = useState(false);

  const fetchNews = async (page, limit) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://news-project-06582-2.onrender.com/news/all?page=${page}&limit=${limit}`
      );

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      if (data.length < limit) setHasMore(false); // no more pages
      setNews((prev) => [...prev, ...data]); // append new news
    } catch (err) {
      console.error(err);
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page, limit);
  }, [page]);

  if (error) return <p className="error">{error}</p>;
  if (!news.length && loading) return <h2 className="loading">Loading news...</h2>;

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

      {/* Pagination Buttons */}
      <div className="see-more-container">
        {hasMore && !loading && (
          <button
            className="see-more-btn"
            onClick={() => setPage((prev) => prev + 1)}
          >
            Load More News →
          </button>
        )}
        {loading && <p>Loading...</p>}
      </div>
    </div>
  );
};

export default Newsbar;
