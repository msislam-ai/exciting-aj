// src/components/NewsSection.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./news.css";

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Normalize categories
  const normalizeCategory = (cat) => {
    const c = (cat || "").toLowerCase().trim();

    if (c.includes("national") || c.includes("জাতীয়")) return "জাতীয়";
    if (c.includes("politics") || c.includes("রাজনীতি")) return "রাজনীতি";
    if (c.includes("sports") || c.includes("খেলা")) return "খেলা";
    if (c.includes("international") || c.includes("আন্তর্জাতিক")) return "আন্তর্জাতিক";

    return "আরও";
  };

  // ✅ Fetch function
  const loadNews = async () => {
    try {
      const res = await axios.get(
        `https://news-project-06582-2.onrender.com/news/all?page=1&limit=1000&_=${Date.now()}`
      );

      let articles = Array.isArray(res.data.data)
        ? res.data.data
        : res.data || [];

      // ✅ Sort by latest date
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      // ✅ Take latest 50
      articles = articles.slice(0, 50);

      const cleaned = articles.map((item) => ({
        ...item,
        category: normalizeCategory(item.category),
      }));

      setNews(cleaned);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load + auto refresh
  useEffect(() => {
    loadNews();

    const interval = setInterval(() => {
      loadNews();
    }, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );

  if (error) return <p className="status-text error">{error}</p>;
  if (!news.length) return <p className="status-text">কোনও খবর নেই</p>;

  // ✅ Group by category
  const groupedNews = news.reduce((acc, item) => {
    const category = item.category || "আরও";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const categoryOrder = [
    "সর্বশেষ",
    "জাতীয়",
    "রাজনীতি",
    "খেলা",
    "আন্তর্জাতিক",
    "আরও",
  ];

  return (
    <section className="news">
      {categoryOrder.map((category) => {
        const categoryNews =
          category === "সর্বশেষ"
            ? news.slice(0, 5) // latest 5
            : groupedNews[category] || [];

        if (category !== "সর্বশেষ" && categoryNews.length === 0) return null;

        return (
          <div key={category} className="category-section">
            {/* Header */}
            <div className="category-header">
              <h2 className="section-title">{category}</h2>
              <Link to={`/category/${encodeURIComponent(category)}`}>
                <button className="see-more">আরও →</button>
              </Link>
            </div>

            {/* Featured */}
            {categoryNews[0] && (
              <div className="featured-news">
                <img
                  src={categoryNews[0].image || "/placeholder.jpg"}
                  alt={categoryNews[0].title}
                />
                <div className="featured-content">
                  <span className="category">
                    {categoryNews[0].category}
                  </span>
                  <Link
                    to={`/article/${
                      categoryNews[0]._id || categoryNews[0].id
                    }`}
                  >
                    <h3>{categoryNews[0].title}</h3>
                    <p>{categoryNews[0].shortDescription}</p>
                  </Link>
                </div>
              </div>
            )}

            {/* Small Cards */}
            <div className="news-grid">
              {categoryNews.slice(1, 5).map((item) => (
                <Link
                  key={item._id || item.id}
                  to={`/article/${item._id || item.id}`}
                  className="news-card"
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
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
          </div>
        );
      })}
    </section>
  );
};

export default NewsSection;
