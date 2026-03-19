import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllNews } from "./newsApi";
import "./news.css";

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchAllNews(1, 50);
        const articles = data.data || [];

        const cleaned = articles.map((item) => ({
          ...item,
          category: (item.category || "আরও").trim(),
        }));

        setNews(cleaned);
      } catch (err) {
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading) return <p className="status-text">Loading news...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (!news.length) return <p className="status-text">কোনও খবর নেই</p>;

  const groupedNews = news.reduce((acc, item) => {
    const category = item.category || "আরও";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const categoryOrder = ["সর্বশেষ", "জাতীয়", "রাজনীতি", "খেলা", "আন্তর্জাতিক", "আরও"];

  return (
    <section className="news">
      {categoryOrder.map((category) => {
        const categoryNews =
          category === "সর্বশেষ" ? news.slice(0, 5) : groupedNews[category] || [];

        if (category !== "সর্বশেষ" && categoryNews.length === 0) return null;

        return (
          <div key={category} className="category-section">
            <div className="category-header">
              <h2 className="section-title">{category}</h2>
              <Link to={`/category/${encodeURIComponent(category)}`}>
                <button className="see-more">আরও →</button>
              </Link>
            </div>

            {categoryNews[0] && (
              <div className="featured-news">
                <img
                  src={categoryNews[0].image || "/placeholder.jpg"}
                  alt={categoryNews[0].title || "News image"}
                />
                <div className="featured-content">
                  <span className="category">{categoryNews[0].category}</span>
                  <Link to={`/article/${categoryNews[0]._id || categoryNews[0].id}`}>
                    <h3>{categoryNews[0].title}</h3>
                    <p>{categoryNews[0].shortDescription}</p>
                  </Link>
                </div>
              </div>
            )}

            <div className="news-grid">
              {categoryNews.slice(1, 5).map((item) => (
                <Link
                  key={item._id || item.id}
                  to={`/article/${item._id || item.id}`}
                  className="news-card"
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.title || "News image"}
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

export default NewsSection;
