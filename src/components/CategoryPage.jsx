import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./news.css";

const pageSize = 6; // 1 featured + 5 small

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

        // ✅ Fetch all news
        const res = await axios.get(
          "https://news-project-06582-2.onrender.com/news/all"
        );
        const allNews = Array.isArray(res.data) ? res.data : [];

        // ✅ Filter by category (handle 'সর্বশেষ' = latest)
        const filteredNews =
          categoryName === "সর্বশেষ"
            ? allNews
            : allNews.filter(
                (item) =>
                  item.category?.trim() === categoryName
              );

        if (filteredNews.length === 0) {
          setNews([]);
          setTotalPages(1);
          return;
        }

        // ✅ Sort newest first
        const sortedNews = filteredNews.sort(
          (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
        );

        // ✅ Slice for pagination
        const startIndex = (currentPage - 1) * pageSize;
        const pagedNews = sortedNews.slice(startIndex, startIndex + pageSize);

        setNews(pagedNews);
        setTotalPages(Math.ceil(filteredNews.length / pageSize));
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName, currentPage]);

  const goToPage = (page) => {
    setSearchParams({ page });
  };

  // ===== Loading / Error / Empty States =====
  if (loading) return <p className="status-text">Loading news...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (news.length === 0) return <p className="status-text">কোনও খবর নেই</p>;

  // ===== Featured + Small News =====
  const featured = news[0];
  const smallNews = news.slice(1);

  return (
    <section className="category-page">
      {/* Header */}
      <div className="category-header">
        <h2 className="section-title">{categoryName}</h2>
        <Link to="/">
          <button className="see-more">হোম →</button>
        </Link>
      </div>

      {/* Featured News */}
      {featured && (
        <div className="featured-news">
          <img
            src={featured.image || "https://via.placeholder.com/600x400"}
            alt={featured.title}
          />
          <div className="featured-content">
            <span className="category">{featured.category}</span>
            <Link to={`/article/${featured._id}`}>
              <h3>{featured.title}</h3>
              <p>{featured.shortDescription}</p>
            </Link>
          </div>
        </div>
      )}

      {/* Small News Grid */}
      <div className="news-grid">
        {smallNews.map((item) => (
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
