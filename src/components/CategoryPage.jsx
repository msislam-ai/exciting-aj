// src/components/CategoryPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./news.css";

const pageSize = 20; // 20 news per page, no featured

// Map backend categories to user-friendly names
const CATEGORY_MAP = {
  general: "জাতীয়",
  national: "জাতীয়",
  politics: "রাজনীতি",
  sports: "খেলা",
  international: "আন্তর্জাতিক",
  others: "আরও",
  latest: "সর্বশেষ", // Special key for today's news
};

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        let allNews = [];

        if (categoryName.toLowerCase() === "সর্বশেষ") {
          // Fetch all news and filter by today's date
          const res = await axios.get(
            `https://news-project-06582-2.onrender.com/news/all`
          );
          const data = Array.isArray(res.data) ? res.data : [];

          const today = new Date();
          allNews = data.filter((item) => {
            const pubDate = new Date(item.pubDate);
            return (
              pubDate.getFullYear() === today.getFullYear() &&
              pubDate.getMonth() === today.getMonth() &&
              pubDate.getDate() === today.getDate()
            );
          });
        } else {
          // Fetch only this category
          const res = await axios.get(
            `https://banglabartaa.news.girlneed.com`
          );
          allNews = Array.isArray(res.data) ? res.data : [];
        }

        // Sort newest first
        allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Paginate
        const startIndex = (currentPage - 1) * pageSize;
        const pagedNews = allNews.slice(startIndex, startIndex + pageSize);

        setNews(pagedNews);
        setTotalPages(Math.ceil(allNews.length / pageSize));
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName, currentPage]);

  const goToPage = (page) => setSearchParams({ page });

  if (loading)
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );

  if (error) return <p className="status-text error">{error}</p>;
  if (!news.length) return <p className="status-text">কোনও খবর নেই</p>;

  return (
    <section className="category-page">
      <div className="category-header">
        <h2 className="section-title">
          {CATEGORY_MAP[categoryName.toLowerCase()] || categoryName}
        </h2>
        <Link to="/">
          <button className="see-more">হোম →</button>
        </Link>
      </div>

      <div className="news-grid">
        {news.map((item) => (
          <Link key={item._id} to={`/article/${item._id}`} className="news-card">
            <img src={item.image || "/placeholder.jpg"} alt={item.title} />
            <div className="news-content">
              <span className="category">
                {CATEGORY_MAP[item.category?.toLowerCase()] || item.category || "আরও"}
              </span>
              <h4>{item.title}</h4>
              <p>{item.shortDescription}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
            ← Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
            Next →
          </button>
        </div>
      )}
    </section>
  );
};

export default CategoryPage;
