import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";
import "./news.css";

const CategoryPage = () => {
  const { categoryName } = useParams(); // from /category/:categoryName
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchAllNews();

        // ✅ Normalize category names and assign fallback for empty/null
        const cleaned = data.map((item) => ({
          ...item,
          category: (item.category || "আরও").trim(),
        }));

        // Debug: check what categories exist in API
        console.log("Route category:", categoryName);
        console.log("Available categories in API:", [
          ...new Set(cleaned.map((n) => n.category)),
        ]);

        // ✅ Filter by category
        const filteredNews =
          categoryName === "সর্বশেষ"
            ? cleaned
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10) // latest 10
            : cleaned.filter(
                (item) =>
                  item.category.trim().toLowerCase() ===
                  categoryName.trim().toLowerCase()
              );

        setNews(filteredNews);
      } catch (err) {
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName]);
  if (error) return <p className="status-text error">{error}</p>;
  if (news.length === 0) return <p className="status-text">কোনও খবর নেই</p>;

  return (
    <section className="news">
      {/* ===== Category Header ===== */}
      <div className="category-header">
        <h2 className="section-title">{categoryName}</h2>
        <Link to="/">
          <button className="see-more">হোম →</button>
        </Link>
      </div>

      {/* ===== Featured News ===== */}
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

      {/* ===== Small News Cards Grid ===== */}
      <div className="news-grid">
        {news.slice(1).map((item) => (
          <Link
            key={item._id}
            to={`/article/${item._id}`}
            className="news-card"
          >
            <img src={item.image || "/placeholder.jpg"} alt={item.title} />
            <div className="news-content">
              <span className="category">{item.category}</span>
              <h4>{item.title}</h4>
              <p>{item.shortDescription}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryPage;
