import { useEffect, useState } from "react";
import { fetchAllNews } from "./newsApi"; // import local api

function Herosection() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchAllNews(1, 10); // fetch first page, 10 articles
        setNews(data.data || []); // <-- use data.data
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

      {news.length === 0 && !error && <p>Loading latest news...</p>}

      {news.map((article) => (
        <div key={article._id} style={{ marginBottom: "20px" }}>
          <h2>
            <a href={`/article/${article._id}`}>{article.title}</a>
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
