import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { fetchAllNews } from "./newsApi";
import "./news.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const pageSize = 6; // 1 featured + 5 smaller news per page

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);

        const res = await fetchAllNews(1, 200); // fetch enough articles
        const allNews = res.data || [];

        const cleaned = allNews.map((item) => ({
          ...item,
          category: (item.category || "আরও").trim(),
          categoryLower: (item.category || "আরও").trim().toLowerCase(),
        }));

        // Filter by category
        let filteredNews =
          categoryName === "সর্বশেষ"
            ? cleaned.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
            : cleaned.filter(
                (item) =>
                  item.categoryLower === categoryName.trim().toLowerCase()
              );

        // Total pages
        setTotalPages(Math.ceil(filteredNews.length / pageSize));

        // Slice for pagination
        const startIndex = (currentPage - 1) * pageSize;
        const pagedNews = filteredNews.slice(startIndex, startIndex + pageSize);

        setNews(pagedNews);
      } catch (err) {
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName, currentPage]);

  if (loading) return <p className="status-text">Loading...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (news.length === 0) return <p className="status-text">কোনও খবর নেই</p>;

  // ===== Pagination Handlers =====
  const goToPage = (page) => {
    setSearchParams({ page });
  };

  return (
    <section className="news">
      <div className="category-header">
        <h2 className="section-title">{categoryName}</h2>
        <Link to="/">
          <button className="see-more">হোম →</button>
        </Link>
      </div>

      {/* ===== FEATURED ===== */}
      {news[0] && (
        <div className="featured-news">
          <img src={news[0].image || "/placeholder.jpg"} alt={news[0].title} />
          <div className="featured-content">
            <span className="category">{news[0].category}</span>
            <Link to={`/article/${news[0]._id}`}>
              <h3>{news[0].title}</h3>
              <p>{news[0].shortDescription}</p>
            </Link>
          </div>
        </div>
      )}

      {/* ===== 5 SMALL NEWS ===== */}
      <div className="news-grid">
        {news.slice(1).map((item) => (
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

      {/* ===== PAGINATION ===== */}
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
