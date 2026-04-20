import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./news.css";

const BASE_URL = "https://banglabartaa.news.girlneed.com";

const NewsSection = ({ keyword = "" }) => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= CATEGORY NORMALIZER ================= */
  const normalizeCategory = (cat) => {
    const c = (cat || "").toLowerCase().trim();

    if (c.includes("national") || c.includes("জাতীয়")) return "জাতীয়";
    if (c.includes("politics") || c.includes("রাজনীতি")) return "রাজনীতি";
    if (c.includes("sports") || c.includes("খেলা")) return "খেলা";
    if (c.includes("international") || c.includes("আন্তর্জাতিক"))
      return "আন্তর্জাতিক";

    return "আরও";
  };

  /* ================= FETCH NEWS ================= */
  const fetchLatestNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/news/all?page=1&limit=100`, {
        timeout: 10000,
      });

      let articles =
        res?.data?.data ||
        res?.data?.news ||
        res?.data ||
        [];

      if (!Array.isArray(articles)) {
        articles = [];
      }

      /* ================= SORT ================= */
      articles.sort(
        (a, b) =>
          new Date(b.publishedAt || b.pubDate) -
          new Date(a.publishedAt || a.pubDate)
      );

      /* ================= KEYWORD FILTER ================= */
      if (keyword.trim()) {
        const k = keyword.toLowerCase();

        articles = articles.filter(
          (item) =>
            (item.title || "").toLowerCase().includes(k) ||
            (item.description || "").toLowerCase().includes(k) ||
            (item.content || "").toLowerCase().includes(k)
        );
      }

      /* ================= CLEAN DATA ================= */
      const cleaned = articles.map((item) => ({
        ...item,
        category: normalizeCategory(item.category),
      }));

      setNews(cleaned);
    } catch (err) {
      console.error(err);
      setError("Failed to load news");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchLatestNews();

    const interval = setInterval(fetchLatestNews, 3 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [keyword]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) return <p className="status-text error">{error}</p>;

  if (!news || news.length === 0)
    return <p className="status-text">কোনও খবর নেই</p>;

  /* ================= GROUP NEWS ================= */
  const groupedNews = news.reduce((acc, item) => {
    const cat = item.category || "আরও";

    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);

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

  /* ================= UI ================= */
  return (
    <section className="news">
      {categoryOrder.map((category) => {
        const categoryNews =
          category === "সর্বশেষ"
            ? news.slice(0, 5)
            : groupedNews[category] || [];

        if (category !== "সর্বশেষ" && categoryNews.length === 0)
          return null;

        return (
          <div key={category} className="category-section">
            {/* HEADER */}
            <div className="category-header">
              <h2 className="section-title">{category}</h2>

              <Link to={`/category/${category}`}>
                <button className="see-more">আরও →</button>
              </Link>
            </div>

            {/* FEATURED */}
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
                    <p>
                      {(categoryNews[0].shortDescription ||
                        categoryNews[0].description ||
                        "")
                        .slice(0, 120)}
                      ...
                    </p>
                  </Link>
                </div>
              </div>
            )}

            {/* GRID */}
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

                    <p>
                      {(item.shortDescription ||
                        item.description ||
                        "")
                        .slice(0, 100)}
                      ...
                    </p>
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
