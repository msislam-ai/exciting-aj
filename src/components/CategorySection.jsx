import { useEffect, useState } from "react";
import "./category.css";
import { Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";

const CategorySection = () => {
  const [categoryData, setCategoryData] = useState({});
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    "জাতীয়",
    "রাজনীতি",
    "খেলা",
    "আন্তর্জাতিক",
    "আরও",
  ]; // ❌ removed "সর্বশেষ"

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetchAllNews(1, 100);
        const data = res.data || [];

        setAllNews(data); // ⭐ store all news

        const grouped = {};
        data.forEach((article) => {
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

      {/* ✅ ONLY ONE সর্বশেষ */}
      {allNews.length > 0 && (
        <div className="category-section">
          <div className="category-header">
            <h2 className="section-title">সর্বশেষ</h2>

            <Link to="/all-news">
              <button className="see-more">আরও →</button>
            </Link>
          </div>

          {/* Featured */}
          <div className="featured-news">
            <img
              src={allNews[0].image || "/placeholder.jpg"}
              alt={allNews[0].title}
            />

            <div className="featured-content">
              <span className="category">{allNews[0].category}</span>

              <Link to={`/article/${allNews[0]._id}`}>
                <h3>{allNews[0].title}</h3>
                <p>{allNews[0].shortDescription}</p>
              </Link>
            </div>
          </div>

          {/* Small */}
          <div className="news-grid">
            {allNews.slice(1, 6).map((item) => (
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
      )}

      {/* ✅ OTHER CATEGORIES */}
      {categories.map((category) => {
        const categoryNews = categoryData[category] || [];

        if (!categoryNews.length) return null;

        return (
          <div key={category} className="category-section">
            <div className="category-header">
              <h2 className="section-title">{category}</h2>

              <Link to={`/category/${encodeURIComponent(category)}`}>
                <button className="see-more">আরও →</button>
              </Link>
            </div>

            {/* Featured */}
            <div className="featured-news">
              <img
                src={categoryNews[0].image || "/placeholder.jpg"}
                alt={categoryNews[0].title}
              />

              <div className="featured-content">
                <span className="category">{categoryNews[0].category}</span>

                <Link to={`/article/${categoryNews[0]._id}`}>
                  <h3>{categoryNews[0].title}</h3>
                  <p>{categoryNews[0].shortDescription}</p>
                </Link>
              </div>
            </div>

            {/* Small */}
            <div className="news-grid">
              {categoryNews.slice(1, 6).map((item) => (
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
