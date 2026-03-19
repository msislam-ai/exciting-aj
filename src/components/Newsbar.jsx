import React, { useState, useEffect } from "react";
import "./newsbar.css";
import { Link } from "react-router-dom";

const Newsbar = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1); // current page
  const [totalPages, setTotalPages] = useState(1); // total pages from backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LIMIT = 5; // number of news per page

  const fetchNews = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://news-project-06582-2.onrender.com/news/all?page=${pageNumber}&limit=${LIMIT}`
      );
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      setNews(data.data); // paginated news
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  if (error) return <p className="error">{error}</p>;
  if (loading) return <h2 className="loading">Loading latest news...</h2>;

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
      <div className="pagination-container">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          ← Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Newsbar;
