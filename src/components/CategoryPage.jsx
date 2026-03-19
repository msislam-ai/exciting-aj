import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./news.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const pageSize = 6; // 1 featured + 5 small

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);

        // Fetch all news for this category
        const res = await axios.get(
          `/api/news/category/${encodeURIComponent(categoryName)}`
        );
        const allNews = Array.isArray(res.data) ? res.data : res.data.data || [];

        // Sort newest first
        const sortedNews = allNews.sort(
          (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
        );

        // Slice for pagination (each page = 6 items)
        const startIndex = (currentPage - 1) * pageSize;
        const pagedNews = sortedNews.slice(startIndex, startIndex + pageSize);

        setNews(pagedNews);
        setTotalPages(Math.ceil(sortedNews.length / pageSize));
      } catch (err) {
        console.log(err);
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

  if (loading) return <p className="status-text">Loading news...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (news.length === 0) return <p className="status-text">কোনও খবর নেই</p>;

  // 1 featured + next 5 small
  const featured = news[0];
  const smallNews = news.slice(1, 6);

  return (
    <section className="category-page">
      <div className="category-header">
        <h2 className="section-title">{categoryName}</h2>
        <Link to="/">
          <button className="see-more">হোম →</button>
        </Link>
      </div>

      {/* Featured News */}
      {featured && (
        <div className="featured-news">
          <img src={featured.image || "/placeholder.jpg"} alt={featured.title} />
          <div className="featured-content">
            <span className="category">{featured.category}</span>
            <Link to={`/article/${featured._id}`}>
              <h3>{featured.title}</h3>
              <p>{featured.shortDescription}</p>
            </Link>
          </div>
        </div>
      )}

      {/* 5 Small News */}
      <div className="news-grid">
        {smallNews.map((item) => (
          <Link key={item._id} to={`/article/${item._id}`} className="news-card">
            <img src={item.image || "/placeholder.jpg"} alt={item.title} />
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
