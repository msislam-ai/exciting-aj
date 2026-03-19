import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";
import "./news.css";

const CategoryPage = () => {
  const { categoryName } = useParams();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);

        // ✅ fetch enough data (no pagination here)
        const res = await fetchAllNews(1, 200);
        const allNews = res.data || [];

        // ✅ normalize category
        const cleaned = allNews.map((item) => ({
          ...item,
          category: (item.category || "আরও").trim(),
        }));

        let filteredNews = [];

        if (categoryName === "সর্বশেষ") {
          // latest news
          filteredNews = cleaned.sort(
            (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
          );
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
  }, [categoryName]);

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

      {/* ===== FEATURED (1 BIG) ===== */}
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

      {/* ===== SMALL NEWS (ONLY 5) ===== */}
      <div className="news-grid">
        {news.slice(1, 6).map((item) => (
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

      {/* ===== SEE MORE BUTTON (GO TO PAGINATION PAGE) ===== */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to={`/all-news?category=${encodeURIComponent(categoryName)}`}>
          <button className="see-more">আরও →</button>
        </Link>
      </div>
    </section>
  );
};

export default CategoryPage;
