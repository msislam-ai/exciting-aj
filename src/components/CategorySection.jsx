import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./category.css";
import axios from "axios";

const CategorySection = () => {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories first
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catRes = await axios.get("/api/news/categories");
        const categories = catRes.data || [];

        const grouped = {};
        // Fetch 6 news per category (1 featured + 5 small)
        await Promise.all(
          categories.map(async (cat) => {
            const newsRes = await axios.get(
              `/api/news/category/${encodeURIComponent(cat)}?page=1&limit=6`
            );
            grouped[cat] = newsRes.data.data || [];
          })
        );

        setCategoryData(grouped);
      } catch (err) {
        console.log(err);
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) return <p className="status-text">Loading categories...</p>;
  if (error) return <p className="status-text error">{error}</p>;

  const categories = Object.keys(categoryData);

  return (
    <section className="category-section">
      <h1 className="category-title">ক্যাটাগরি সমূহ</h1>

      {categories.map((cat) => {
        const newsItems = categoryData[cat];
        if (!newsItems || newsItems.length === 0) return null;

        const featured = newsItems[0]; // first as featured
        const smallNews = newsItems.slice(1, 6); // next 5 as small

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

            {/* Small News Grid */}
            <div className="news-grid">
              {smallNews.map((item) => (
                <Link key={item._id} to={`/article/${item._id}`} className="news-card">
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
    </section>
  );
};

export default CategorySection;
