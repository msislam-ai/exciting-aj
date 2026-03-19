import { useEffect, useState } from "react";
import "./category.css";
import { Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";

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
    const loadNews = async () => {
      try {
        const res = await fetchAllNews(1, 100); // enough data
        const allNews = res.data || [];

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
  }, []);

  if (loading) return <p className="status-text">Loading...</p>;
  if (error) return <p className="status-text error">{error}</p>;

  return (
    <section className="news">
      {categories.map((category) => {
        const categoryNews =
          category === "সর্বশেষ"
            ? Object.values(categoryData).flat()
            : categoryData[category] || [];

        // ❗ Skip if empty
        if (!categoryNews.length) return null;

        const featured = categoryNews[0];
        const smallNews = categoryNews.slice(1, 6); // 5 small

        return (
          <div key={category} className="category-section">
            {/* ===== HEADER ===== */}
            <div className="category-header">
              <h2 className="section-title">{category}</h2>

              <Link to={`/category/${encodeURIComponent(category)}`}>
                <button className="see-more">আরও →</button>
              </Link>
            </div>

            {/* ===== FEATURED NEWS ===== */}
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

            {/* ===== SMALL NEWS ===== */}
            <div className="news-grid">
              {smallNews.map((item) => (
                <Link
                  key={item._id}
                  to={`/article/${item._id}`}
                  className="news-card"
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.title}
                  />

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
