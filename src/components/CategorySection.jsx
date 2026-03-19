import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import { Link } from "react-router-dom";
import { fetchNewsByCategory } from "./newsApi";
import "./category.css";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 1️⃣ Fetch all categories dynamically
        const res = await fetch("/api/news/categories");
        const fetchedCategories = await res.json();
        setCategories(fetchedCategories);

        // 2️⃣ Fetch 6 news per category (1 featured + 5 small)
        const grouped = {};
        await Promise.all(
          fetchedCategories.map(async (cat) => {
            const newsRes = await fetchNewsByCategory(cat, 1, 6);
            grouped[cat] = newsRes.data || [];
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
        {categories.map((cat) => {
          const newsItems = categoryData[cat] || [];
          if (newsItems.length === 0) return null;

          const featured = newsItems[0];
          const smallNews = newsItems.slice(1, 6);

          return (
            <div key={cat} className="category-block">
              {/* Category Header */}
              <div className="category-header">
                <h2 className="section-title">{cat}</h2>
                <Link to={`/category/${encodeURIComponent(cat)}`}>
                  <button className="see-more">আরও →</button>
                </Link>
              </div>

              {/* Featured News */}
              {featured && (
                <div className="featured-news">
                  <img
                    src={featured.image || "/placeholder.jpg"}
                    alt={featured.title}
                  />
                  <div className="featured-content">
                    <span className="category">{featured.category}</span>
                    <Link to={`/article/${featured._id}`}>
                      <h3>{featured.title}</h3>
                      <p>{featured.shortDescription}</p>
                    </Link>
                  </div>
                </div>
              )}

              {/* Small News */}
              <div className="news-grid">
                {smallNews.map((item) => (
                  <Link
                    key={item._id}
                    to={`/article/${item._id}`}
                    className="news-card"
                  >
                    <img src={item.image || "/placeholder.jpg"} alt={item.title} />
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
      </div>
    </section>
  );
};

export default CategorySection;
