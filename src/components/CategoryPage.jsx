import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./news.css";

const pageSize = 20;

const CATEGORY_MAP = {
  general: "জাতীয়",
  national: "জাতীয়",
  politics: "রাজনীতি",
  sports: "খেলা",
  international: "আন্তর্জাতিক",
  others: "আরও",
  latest: "সর্বশেষ",
};

const BASE_URL = "https://banglabartaa.news.girlneed.com";

const CategoryPage = () => {
  const { categoryName } = useParams();

  const [news, setNews] = useState(null); // 👈 important
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = "";

        // ✅ Handle "latest" (today's news)
        if (categoryName.toLowerCase() === "সর্বশেষ") {
          url = `${BASE_URL}/news/all?page=${currentPage}&limit=100`;
        } else {
          // ✅ Use backend category endpoint (FAST)
          url = `${BASE_URL}/news/category/${categoryName}?page=${currentPage}&limit=${pageSize}`;
        }

        const res = await axios.get(url, { timeout: 10000 });

        let data = res?.data?.data || res?.data || [];

        // ✅ Ensure array
        if (!Array.isArray(data)) data = [];

        // ✅ Filter today's news (only for latest)
        if (categoryName.toLowerCase() === "সর্বশেষ") {
          const today = new Date();

          data = data.filter((item) => {
            const date = new Date(item.publishedAt || item.pubDate);

            return (
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate()
            );
          });
        }

        // ✅ Sort latest first
        data.sort(
          (a, b) =>
            new Date(b.publishedAt || b.pubDate) -
            new Date(a.publishedAt || a.pubDate)
        );

        // ✅ Pagination (only for latest)
        let pagedNews = data;

        if (categoryName.toLowerCase() === "সর্বশেষ") {
          const startIndex = (currentPage - 1) * pageSize;
          pagedNews = data.slice(startIndex, startIndex + pageSize);
          setTotalPages(Math.ceil(data.length / pageSize));
        } else {
          // backend already paginated
          setTotalPages(res?.data?.totalPages || 1);
        }

        setNews(pagedNews);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch news");
        setNews([]); // 👈 prevent infinite loading
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [categoryName, currentPage]);

  const goToPage = (page) => {
    setSearchParams({ page });
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) return <p className="status-text error">{error}</p>;

  if (!news || news.length === 0) {
    return <p className="status-text">কোনও খবর নেই</p>;
  }

  return (
    <section className="category-page">
      <div className="category-header">
        <h2 className="section-title">
          {CATEGORY_MAP[categoryName?.toLowerCase()] || categoryName}
        </h2>

        <Link to="/">
          <button className="see-more">হোম →</button>
        </Link>
      </div>

      <div className="news-grid">
        {news.map((item) => (
          <Link
            key={item._id}
            to={`/article/${item._id}`}
            className="news-card"
          >
            <img
              src={item.image || "/placeholder.jpg"}
              alt={item.title}
              loading="lazy"
            />

            <div className="news-content">
              <span className="category">
                {CATEGORY_MAP[item.category?.toLowerCase()] ||
                  item.category ||
                  "আরও"}
              </span>

              <h4>{item.title}</h4>
      
            </div>
          </Link>
        ))}
      </div>

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            ← Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
};

export default CategoryPage;
