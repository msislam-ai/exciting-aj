// src/components/AllNewsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./allNews.css";

const AllNewsPage = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LIMIT = 100; // 100 news per page

  const fetchNews = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://news-project-06582-2.onrender.com/news/all?page=${pageNumber}&limit=${LIMIT}`
      );
      if (!res.ok) throw new Error("Failed to fetch news");

      const data = await res.json();

      setNews(data.data || []);
      setPage(data.page || pageNumber);
      setTotalPages(data.totalPages || 1);
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

  if (loading) return <h2 className="loading">Loading news...</h2>;
  if (error) return <p className="error">{error}</p>;
  if (!news.length) return <p>No news available</p>;

  return (
    <div className="all-news-wrapper">
      <h1>All News</h1>

      <div className="news-container">
        {news.map((article) => (
          <div key={article._id || article.id} className="news-card">
            <div className="image-wrapper">
              <img src={article.image || "/placeholder.jpg"} alt={article.title} />
            </div>
            <div className="news-content">
              {/* Category */}
              <span className="news-category">{article.category || "আরও"}</span>

              <Link to={`/article/${article.id || article._id}`}>
                <h3>{article.title}</h3>
              </Link>
              <p>{article.shortDescription}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          ← Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default AllNewsPage;
