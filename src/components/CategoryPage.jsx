import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";
import "./news.css";

const CategoryPage = () => {
  const { categoryName } = useParams();

  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1); // ✅ pagination
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);

        // ✅ FIX: use paginated API correctly
        const res = await fetchAllNews(page, 50);
        const allNews = res.data || [];

        setTotalPages(res.totalPages || 1);

        // ✅ Normalize category
        const cleaned = allNews.map((item) => ({
          ...item,
          category: (item.category || "আরও").trim(),
        }));

        // ✅ Filter
        let filteredNews = [];

        if (categoryName === "সর্বশেষ") {
          filteredNews = cleaned;
        } else {
          filteredNews = cleaned.filter(
            (item) =>
              item.category.toLowerCase() ===
              categoryName.trim().toLowerCase()
          );
        }

        setNews(filteredNews);
      } catch (err) {
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName, page]);

  if (loading) return <p className="status-text">Loading...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (news.length === 0) return <p className="status-text">কোনও খবর নেই</p>;

  return (
    <section className="news">
      {/* ===== HEADER ===== */}
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

      {/* ===== GRID ===== */}
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
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          style={{ marginRight: "10px" }}
        >
          ← Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          style={{ marginLeft: "10px" }}
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default CategoryPage;
