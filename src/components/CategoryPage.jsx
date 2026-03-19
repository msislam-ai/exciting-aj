import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./news.css";

const pageSize = 20; // 20 news per page

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all news
        const res = await axios.get(
          "https://news-project-06582-2.onrender.com/news/all"
        );
        const allNews = Array.isArray(res.data) ? res.data : [];

        // Filter by category ('সর্বশেষ' = latest = all news)
        const filteredNews =
          categoryName === "সর্বশেষ"
            ? allNews
            : allNews.filter((item) => item.category?.trim() === categoryName);

        // Sort newest first
        const sortedNews = filteredNews.sort(
          (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
        );

        // Paginate
        const startIndex = (currentPage - 1) * pageSize;
        setNews(sortedNews.slice(startIndex, startIndex + pageSize));
        setTotalPages(Math.ceil(sortedNews.length / pageSize));
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName, currentPage]);

  const goToPage = (page) => setSearchParams({ page });

  if (loading) return <p className="status-text">Loading news...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (!news.length) return <p className="status-text">কোনও খবর নেই</p>;

  return (
    <section className="category-page">
      <h2 className="section-title">{categoryName}</h2>

      {/* News Grid */}
      <div className="news-grid">
        {news.map((item) => (
          <Link key={item._id} to={`/article/${item._id}`} className="news-card">
            <img
              src={item.image || "https://via.placeholder.com/400x250"}
              alt={item.title}
            />
            <div className="news-content">
              <span className="category">{item.category}</span>
              <h4>{item.title}</h4>
              <p>{item.shortDescription}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoryPage;
