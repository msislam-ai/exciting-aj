import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./news.css";

const BASE_URL = "https://banglabartaa.news.girlneed.com/api/news";

/* ================= CATEGORY MAP ================= */
const CATEGORY_MAP = {
  national: "জাতীয়",
  politics: "রাজনীতি",
  sports: "খেলা",
  international: "আন্তর্জাতিক",
  others: "আরও",
};

const REVERSE_MAP = {
  "জাতীয়": "national",
  "রাজনীতি": "politics",
  "খেলা": "sports",
  "আন্তর্জাতিক": "international",
  "আরও": "others",
};

const NewsSection = ({ keyword = "" }) => {
  const [newsData, setNewsData] = useState({});
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    "জাতীয়",
    "রাজনীতি",
    "খেলা",
    "আন্তর্জাতিক",
    "আরও",
  ];

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = {};

      /* ===== LATEST ===== */
      const latestRes = await axios.get(`${BASE_URL}/latest?limit=10`);
      let latestNews = latestRes.data || [];

      /* ===== KEYWORD FILTER ===== */
      if (keyword.trim()) {
        const k = keyword.toLowerCase();
        latestNews = latestNews.filter(
          (item) =>
            (item.title || "").toLowerCase().includes(k) ||
            (item.description || "").toLowerCase().includes(k)
        );
      }

      setLatest(latestNews);

      /* ===== CATEGORY DATA ===== */
      await Promise.all(
        categories.map(async (cat) => {
          try {
            const backendCat = REVERSE_MAP[cat];

            const res = await axios.get(
              `${BASE_URL}/category/${backendCat}`
            );

            let data = res.data || [];

            if (keyword.trim()) {
              const k = keyword.toLowerCase();
              data = data.filter(
                (item) =>
                  (item.title || "").toLowerCase().includes(k) ||
                  (item.description || "").toLowerCase().includes(k)
              );
            }

            result[cat] = data;
          } catch {
            result[cat] = [];
          }
        })
      );

      setNewsData(result);

    } catch (err) {
      console.error(err);
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 3 * 60 * 60 * 1000);

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

  if (!latest.length)
    return <p className="status-text">কোনও খবর নেই</p>;

  /* ================= UI ================= */
  return (
    <section className="news">

      {/* ===== LATEST ===== */}
      <div className="category-section">
        <div className="category-header">
          <h2 className="section-title">সর্বশেষ</h2>
        </div>

        <div className="news-grid">
          {latest.slice(0, 5).map((item) => (
            <Link
              key={item._id}
              to={`/article/${item._id}`}
              className="news-card"
            >
              <img src={item.image || "/placeholder.jpg"} alt={item.title} />
              <div className="news-content">
                <span className="category">সর্বশেষ</span>
                <h4>{item.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== CATEGORY SECTIONS ===== */}
      {categories.map((cat) => {
        const categoryNews = newsData[cat] || [];

        if (!categoryNews.length) return null;

        return (
          <div key={cat} className="category-section">
            <div className="category-header">
              <h2 className="section-title">{cat}</h2>

              <Link to={`/category/${cat}`}>
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
                  <span className="category">{cat}</span>

                  <Link to={`/article/${categoryNews[0]._id}`}>
                    <h3>{categoryNews[0].title}</h3>
                    <p>
                      {(categoryNews[0].description || "").slice(0, 120)}...
                    </p>
                  </Link>
                </div>
              </div>
            )}

            {/* GRID */}
            <div className="news-grid">
              {categoryNews.slice(1, 5).map((item) => (
                <Link
                  key={item._id}
                  to={`/article/${item._id}`}
                  className="news-card"
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.title}
                  />

                  <div className="news-content">
                    <span className="category">{cat}</span>
                    <h4>{item.title}</h4>
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
