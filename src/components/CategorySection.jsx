import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import "./category.css";
import { Link } from "react-router-dom";
import axios from "axios";

// Bangla categories → backend categories
const CATEGORY_MAP = {
  "সর্বশেষ": "latest",
  "জাতীয়": "national",
  "রাজনীতি": "politics",
  "খেলা": "sports",
  "আন্তর্জাতিক": "international",
  "আরও": "others",
};

const CategorySection = () => {
  const [counts, setCounts] = useState({});
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
    const loadCounts = async () => {
      try {
        const requests = categories.map((cat) => {
          const backendCat = CATEGORY_MAP[cat];

          // latest handled separately
          if (backendCat === "latest") {
            return axios.get(
              `https://banglabartaa.news.girlneed.com/news/latest`
            );
          }

          return axios.get(
            `https://banglabartaa.news.girlneed.com/news/category/${backendCat}?page=1&limit=1`
          );
        });

        const responses = await Promise.all(requests);

        const newCounts = {};

        responses.forEach((res, i) => {
          const cat = categories[i];

          if (cat === "সর্বশেষ") {
            newCounts[cat] = res.data?.length || 0;
          } else {
            newCounts[cat] = res.data?.total || 0;
          }
        });

        setCounts(newCounts);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCounts();
  }, []);

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
            <CategoryCard title={cat} count={counts[cat] || 0} />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
