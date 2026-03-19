import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import "./category.css";
import { Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";

const CategorySection = () => {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1); // ✅ pagination
  const [totalPages, setTotalPages] = useState(1);

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
        // ✅ fetch paginated data
        const res = await fetchAllNews(page, 100);

        const allNews = res.data || []; // 🔥 IMPORTANT FIX
        setTotalPages(res.totalPages || 1);

        // ===== GROUP NEWS BY CATEGORY =====
        const grouped = {};
        allNews.forEach((article) => {
          const cat = (article.category || "আরও").trim();
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
  }, [page]); // ✅ refetch when page changes

  // ===== COUNT FUNCTION =====
  const getCount = (cat) => {
    if (cat === "সর্বশেষ") {
      return Object.values(categoryData).flat().length;
    }
    return categoryData[cat]?.length || 0;
  };

  if (loading) return <p className="status-text">Loading categories...</p>;
  if (error) return <p className="status-text error">{error}</p>;

  return (
    <section className="category-section">
      <h1 className="category-title">ক্যাটাগরি সমূহ</h1>

      {/* ===== CATEGORY GRID ===== */}
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

      {/* ===== PAGINATION ===== */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          style={{ marginRight: "10px" }}
        >
          ← Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          style={{ marginLeft: "10px" }}
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default CategorySection;
