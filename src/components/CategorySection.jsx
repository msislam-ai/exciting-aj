import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import { Link } from "react-router-dom";
import axios from "axios";
import "./category.css";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 1️⃣ Fetch categories dynamically
        const catRes = await axios.get("/api/news/categories");
        const fetchedCategories = catRes.data || [];

        setCategories(fetchedCategories);

        // 2️⃣ Fetch 6 news per category (1 featured + 5 small)
        const grouped = {};
        await Promise.all(
          fetchedCategories.map(async (cat) => {
            const newsRes = await axios.get(
              `/api/news/category/${encodeURIComponent(cat)}`
            );
            grouped[cat] = newsRes.data.data || newsRes.data || [];
          })
        );

        setCategoryData(grouped);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
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
            <CategoryCard
              title={cat}
              count={categoryData[cat]?.length || 0}
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
