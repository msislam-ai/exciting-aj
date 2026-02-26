import { useEffect, useState } from "react";
import "./news.css";

const NewsSection = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Dummy news data (Replace later with your backend or RSS)
    setNews([
      {
        id: 1,
        title: "AI Technology Changing The Future",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
        description:
          "Artificial Intelligence is transforming industries worldwide with powerful automation tools.",
      },
      {
        id: 2,
        title: "Football World Cup Preparation Begins",
        category: "Sports",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
        description:
          "Teams are preparing intensely for the upcoming global football championship.",
      },
      {
        id: 3,
        title: "Global Economy Facing New Challenges",
        category: "Business",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
        description:
          "Experts warn about inflation and financial instability in global markets.",
      },
      {
        id: 4,
        title: "New Medical Breakthrough Announced",
        category: "Health",
        image: "https://images.unsplash.com/photo-1584515933487-779824d29309",
        description:
          "Scientists discovered new treatment possibilities for rare diseases.",
      },
    ]);
  }, []);

  return (
    <section className="news">
      <h2 className="section-title">Latest News</h2>

      {/* Featured News */}
      {news[0] && (
        <div className="featured-news">
          <img src={news[0].image} alt="featured" />

          <div className="featured-content">
            <span className="category">{news[0].category}</span>
            <h3>{news[0].title}</h3>
            <p>{news[0].description}</p>
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="news-grid">
        {news.slice(1).map((item) => (
          <div className="news-card" key={item.id}>
            <img src={item.image} alt="news" />

            <div className="news-content">
              <span className="category">{item.category}</span>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
