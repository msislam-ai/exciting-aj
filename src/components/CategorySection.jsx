// src/components/CategorySection.jsx
import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import "./category.css";
import { Link } from "react-router-dom";
import axios from "axios";

// Map backend categories to user-friendly Bangla names
const CATEGORY_MAP = {
  general: "জাতীয়",
  national: "জাতীয়",
  politics: "রাজনীতি",
  sports: "খেলা",
  international: "আন্তর্জাতিক",
  others: "আরও",
  latest: "সর্বশেষ",
};

const CategorySection = () => {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fixed categories to display
  const categories = [
    "সর্বশেষ",
    "জাতীয়",
    "রাজনীতি",
    "খেলা",
    "আন্তর্জাতিক",
    "আরও",
  ];

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        // Fetch all news locally
        const res = await axios.get("https://news-project-06582-2.onrender.com/news/all");
        const data = Array.isArray(res.data) ? res.data : [];

        // Group news by category
        const grouped = {};
        const today = new Date();

        data.forEach((article) => {
          // trim category and map to Bangla names
          const cat = (article.category || "others").trim().toLowerCase();
          const mappedCat = CATEGORY_MAP[cat] || "আরও";

          if (!grouped[mappedCat]) grouped[mappedCat] = [];
          grouped[mappedCat].push(article);

          // Also handle "সর্বশেষ" for today
          const pubDate = new Date(article.pubDate);
          if (
            pubDate.getFullYear() === today.getFullYear() &&
            pubDate.getMonth() === today.getMonth() &&
            pubDate.getDate() === today.getDate()
          ) {
            if (!grouped["সর্বশেষ"]) grouped["সর্বশেষ"] = [];
            grouped["সর্বশেষ"].push(article);
          }
        });

        setCategoryData(grouped);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  // Count function for each category
  const getCount = (cat) => categoryData[cat]?.length || 0;

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
