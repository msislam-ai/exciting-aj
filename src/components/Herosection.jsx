import { useEffect, useState } from "react";

function Herosection() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://news-project-06582-2.onrender.com/news/all")
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        setNews(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch news");
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Latest News</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {news.map((article) => (
        <div key={article._id}>
            <h2><a href="#">{article.title}</a></h2>
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
