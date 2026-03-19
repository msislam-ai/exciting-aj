import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";
import "./news.css";

const CategoryPage = () => {
  const { categoryName } = useParams(); // from /category/:categoryName
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const res = await fetchAllNews(page, 50); // fetch 50 per page

        if (!res || !res.data) throw new Error("No news data");

        // Normalize category names
        const cleaned = res.data.map((item) => ({
          ...item,
          category: (item.category || "আরও").trim(),
        }));

        // Filter by category
        const filteredNews =
          categoryName === "সর্বশেষ"
            ? cleaned
            : cleaned.filter(
                (item) =>
                  item.category.trim().toLowerCase() ===
                  categoryName.trim().toLowerCase()
              );

        setNews(filteredNews);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName, page]);

  if (loading) return <p className="status-text">Loading news...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (news.length === 0) return <p className="status-text">কোনও খবর নেই</p>;

  return (
    <section className="news">
      <div className="category-header">
        <h2 className="section-title">{categoryName}</h2>
        <Link to="/">
          <button className="see-more">হোম →</button>
        </Link>
      </div>

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

      {/* ===== Pagination Buttons ===== */}
      <div className="pagination">
        {page > 1 && (
          <button onClick={() => setPage(page - 1)}>← Previous</button>
        )}
        {page < totalPages && (
          <button onClick={() => setPage(page + 1)}>Next →</button>
        )}
        <span>
          Page {page} of {totalPages}
        </span>
      </div>
    </section>
  );
};

export default CategoryPage;
