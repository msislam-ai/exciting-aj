import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import "./category.css";
import { Link } from "react-router-dom";
import axios from "axios";

/* ================= CATEGORY MAP ================= */
const CATEGORY_MAP = {
  general: "জাতীয়",
  national: "জাতীয়",
  politics: "রাজনীতি",
  sports: "খেলা",
  international: "আন্তর্জাতিক",
  others: "আরও",
};

const CategorySection = () => {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    "সর্বশেষ",
    "জাতীয়",
    "রাজনীতি",
    "খেলা",
    "আন্তর্জাতিক",
    "আরও",
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        /* ===== FETCH CATEGORY LIST ===== */
        const res = await axios.get(
          "https://banglabartaa.news.girlneed.com/api/news/categories"
        );

        const backendCategories = res.data || [];

        const counts = {};

        /* ===== FETCH COUNT PER CATEGORY ===== */
        await Promise.all(
          backendCategories.map(async (cat) => {
            try {
              const response = await axios.get(
                `https://banglabartaa.news.girlneed.com/api/news/category/${cat}`
              );

              const mapped = CATEGORY_MAP[cat] || "আরও";

              counts[mapped] = response.data?.length || 0;
            } catch {
              // skip error silently
            }
          })
        );

        /* ===== LATEST COUNT ===== */
        const latestRes = await axios.get(
          "https://banglabartaa.news.girlneed.com/api/news/latest?limit=20"
        );

        counts["সর্বশেষ"] = latestRes.data?.length || 0;

        setCategoryData(counts);

      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const getCount = (cat) => categoryData[cat] || 0;

  if (loading) return <p className="status-text">Loading categories...</p>;
  if (error) return <p className="status-text error">{error}</p>;

  return (
    <section className="category-section">
      <h1 className="category-title">ক্যাটাগরি সমূহ</h1>

      <div className="category-grid">
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/category/${encodeURIComponent(cat)}`}
            className="category-card"
          >
            <CategoryCard title={cat} count={getCount(cat)} />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
