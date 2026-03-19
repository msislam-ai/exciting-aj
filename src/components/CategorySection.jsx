import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./category.css";
import { fetchAllNews } from "./newsApi";

const CategorySection = () => {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        // Fetch enough news for all categories
        const res = await fetchAllNews(1, 1000); // page 1, 1000 articles
        const allNews = res.data || [];

        // Group news by category (trimmed)
        const grouped = {};
        allNews.forEach((article) => {
          const cat = (article.category || "আরও").trim();
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(article);
        });

        setCategoryData(grouped);
      } catch (err) {
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading) return <p className="status-text">Loading categories...</p>;
  if (error) return <p className="status-text error">{error}</p>;

  // Get all category names dynamically
  const categories = Object.keys(categoryData);

  return (
    <section className="category-section">
      <h1 className="category-title">ক্যাটাগরি সমূহ</h1>

      {categories.map((cat) => {
        const newsItems = categoryData[cat];

        if (!newsItems || newsItems.length === 0) return null;

        // 1 featured + next 5 smaller
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

            {/* 5 Small News Cards */}
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
