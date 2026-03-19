import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryCard from "./CategoryCard";
import { fetchAllNews, fetchNewsByCategory } from "./newsApi";
import "./category.css";

const categories = [
  "সর্বশেষ",
  "জাতীয়",
  "রাজনীতি",
  "খেলা",
  "আন্তর্জাতিক",
  "আরও",
];

const CategorySection = () => {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const grouped = {};

        // Fetch 6 news per category
        await Promise.all(
          categories.map(async (cat) => {
            let res;
            if (cat === "সর্বশেষ") {
              res = await fetchAllNews(1, 6);
            } else {
              res = await fetchNewsByCategory(cat, 1, 6);
            }
            grouped[cat] = res.data;
          })
        );

        setCategoryData(grouped);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load categories");
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
          const newsItems = categoryData[cat];
          if (!newsItems || newsItems.length === 0) return null;

          const featured = newsItems[0];
          const smallNews = newsItems.slice(1, 6);

          return (
            <div key={cat} className="category-block">
              <div className="category-header">
                <h2 className="section-title">{cat}</h2>
                <Link to={`/category/${encodeURIComponent(cat)}`}>
                  <button className="see-more">আরও →</button>
                </Link>
              </div>

              {/* Featured */}
              {featured && (
                <div className="featured-news">
                  <img src={featured.image || "/placeholder.jpg"} alt={featured.title} />
                  <div className="featured-content">
                    <span className="category">{featured.category}</span>
                    <Link to={`/article/${featured._id}`}>
                      <h3>{featured.title}</h3>
                      <p>{featured.shortDescription}</p>
                    </Link>
                  </div>
                </div>
              )}

              {/* Small news */}
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
      </div>
    </section>
  );
};

export default CategorySection;
