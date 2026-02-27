import { useEffect, useState } from "react";
import { fetchAllNews } from "./newsApi"; // import local api

function Herosection() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchAllNews();
        setNews(data);
      } catch (err) {
        setError("Failed to fetch news");
      }
    };

    loadNews();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Latest News</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {news.map((article) => (
        <div key={article._id}>
          <h2>
            <a href="#">{article.title}</a>
          </h2>

          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              style={{ width: "300px", borderRadius: "6px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default Herosection;
