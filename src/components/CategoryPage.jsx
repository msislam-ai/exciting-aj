import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./news.css";

const BASE_URL = "https://banglabartaa.news.girlneed.com/api/news";

/* ================= MAP ================= */
const REVERSE_MAP = {
  "জাতীয়": "national",
  "রাজনীতি": "politics",
  "খেলা": "sports",
  "আন্তর্জাতিক": "international",
  "আরও": "others",
};

const CATEGORY_MAP = {
  national: "জাতীয়",
  politics: "রাজনীতি",
  sports: "খেলা",
  international: "আন্তর্জাতিক",
  others: "আরও",
};

const CategoryPage = () => {
  const { categoryName } = useParams();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);

        let data = [];

        /* ===== LATEST ===== */
        if (categoryName === "সর্বশেষ") {
          const res = await axios.get(`${BASE_URL}/latest?limit=50`);
          data = res.data || [];
        } else {
          /* ===== CATEGORY ===== */
          const backendCat = REVERSE_MAP[categoryName] || "others";

          const res = await axios.get(
            `${BASE_URL}/category/${backendCat}`
          );

          data = res.data || [];
        }

        if (!Array.isArray(data)) data = [];

        setNews(data);

      } catch (err) {
        console.error(err);
        setError("Failed to fetch news");
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) return <p className="status-text error">{error}</p>;

  if (!news || news.length === 0) {
    return <p className="status-text">কোনও খবর নেই</p>;
  }

  /* ================= UI ================= */

  return (
    <section className="category-page">
      <div className="category-header">
        <h2 className="section-title">{categoryName}</h2>

        <Link to="/">
          <button className="see-more">হোম →</button>
        </Link>
      </div>

      <div className="news-grid">
        {news.map((item) => (
          <Link
            key={item._id}
            to={`/article/${item._id}`}
            className="news-card"
          >
            <img
              src={item.image || "/placeholder.jpg"}
              alt={item.title}
              loading="lazy"
            />

            <div className="news-content">
              <span className="category">
                {CATEGORY_MAP[item.category] || "আরও"}
              </span>

              <h4>{item.title}</h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryPage;
