import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./allNews.css";

const AllNewsPage = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LIMIT = 100; // Number of news per page

  // Fetch news function
  const fetchNews = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Add timestamp to prevent caching
      const res = await fetch(
        `https://news-project-06582-2.onrender.com/news/all?page=${pageNumber}&limit=${LIMIT}&_=${Date.now()}`
      );
      if (!res.ok) throw new Error("Failed to fetch news");

      const data = await res.json();

      // Sort by updatedAt descending
      const sortedNews = (data.data || []).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      // Merge with existing news and remove duplicates
      setNews((prevNews) => {
        const merged = [...sortedNews, ...prevNews];
        const unique = merged.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t._id === item._id)
        );
        return unique;
      });

      setPage(data.page || pageNumber);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  // Fetch first page initially
  useEffect(() => {
    fetchNews(1);
  }, []);

  // Auto-refresh latest news every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews(1); // Always fetch page 1 for newest news
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Format updatedAt timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("bn-BD", { hour12: true });
  };

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
              <span className="news-category">{article.category || "আরও"}</span>

              <Link to={`/article/${article.id || article._id}`}>
                <h3>{article.title}</h3>
              </Link>

              {article.updatedAt && (
                <p className="updated-time">
                  আপডেট হয়েছে: {formatTime(article.updatedAt)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => {
            const prev = page - 1;
            setPage(prev);
            fetchNews(prev);
          }}
        >
          ← Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => {
            const next = page + 1;
            setPage(next);
            fetchNews(next);
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default AllNewsPage;
