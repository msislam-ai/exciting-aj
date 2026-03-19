import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import "./category.css";
import { Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";

const CategorySection = () => {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fixed categories array
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
      try {
        const data = await fetchAllNews();

        // ===== GROUP NEWS BY CATEGORY (trimmed to avoid mismatch) =====
        const grouped = {};
        data.forEach((article) => {
          const cat = (article.category || "আরও").trim(); // trim spaces
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(article);
        });

        setCategoryData(grouped);
      } catch (err) {
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  // ===== COUNT FUNCTION =====
  const getCount = (cat) => {
    if (cat === "সর্বশেষ") {
      // sum of all categories
      return Object.values(categoryData).flat().length;
    }
    return categoryData[cat]?.length || 0;
  };

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

