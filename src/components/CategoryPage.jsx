// src/components/CategoryPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const PAGE_SIZE = 20; // 20 news per page

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        // Fetch category news with server-side pagination
        const res = await axios.get(
          `https://news-project-06582-2.onrender.com/news/category/${encodeURIComponent(
            categoryName
          )}?page=${currentPage}&limit=${PAGE_SIZE}`
        );

        const data = res.data;
        setNews(data.data || []);
        setTotalPages(data.totalPages || 1);
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
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}></div>
        <p>Loading news...</p>
      </div>
    );

  if (error)
    return (
      <div style={styles.errorWrapper}>
        <p>{error}</p>
        <Link to="/" style={styles.backBtn}>
          ← Back to Home
        </Link>
      </div>
    );

  if (!news.length)
    return <p style={{ padding: "50px 8%", textAlign: "center" }}>No news found!</p>;

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <h2>{categoryName}</h2>
        <Link to="/" style={styles.backBtn}>
          হোম →
        </Link>
      </div>

      <div style={styles.grid}>
        {news.map((item) => (
          <Link
            key={item._id}
            to={`/article/${item._id}`}
            style={styles.card}
          >
            <img
              src={item.image || "/placeholder.jpg"}
              alt={item.title}
              style={styles.image}
            />
            <div style={styles.cardContent}>
              <span style={styles.category}>{item.category || "আরও"}</span>
              <h4 style={styles.title}>{item.title}</h4>
              <p style={styles.description}>{item.shortDescription}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
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

const styles = {
  container: {
    padding: "50px 8%",
    fontFamily: "Segoe UI, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  backBtn: {
    textDecoration: "none",
    color: "#e63946",
    fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    textDecoration: "none",
    color: "#000",
    border: "1px solid #eee",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "transform 0.2s",
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "15px",
  },
  category: {
    color: "#e63946",
    fontWeight: 600,
    fontSize: "0.8rem",
  },
  title: {
    fontSize: "1rem",
    margin: "8px 0",
    fontWeight: 600,
  },
  description: {
    fontSize: "0.85rem",
    color: "#555",
  },
  pagination: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
  },
  loadingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "15px",
    fontSize: "1.1rem",
    color: "#555",
  },
  spinner: {
    border: "6px solid #f3f3f3",
    borderTop: "6px solid #e63946",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
  },
  errorWrapper: {
    padding: "50px 8%",
    textAlign: "center",
    color: "red",
  },
};

// Add spinner animation keyframes
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`, styleSheet.cssRules.length);

export default CategoryPage;
