import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const today = new Date();

const banglaDate = today.toLocaleDateString("bn-BD", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ✅ SAME categories as CategorySection
  const categories = [
    "সর্বশেষ",
    "জাতীয়",
    "রাজনীতি",
    "খেলা",
    "আন্তর্জাতিক",
    "আরও",
  ];

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav style={styles.navbar}>
      {/* ===== TOP PART ===== */}
      <div style={styles.topPart}>
        <p style={styles.date}>{banglaDate}</p>

        <h2 style={styles.logo}>বাংলা বার্তা</h2>

        <div style={styles.right}>
          <div style={styles.socialIcons}>
            <a href="#"><i className="fa-brands fa-youtube"></i></a>
            <a href="#"><i className="fa-brands fa-linkedin"></i></a>
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-facebook"></i></a>
          </div>

          {isMobile && (
            <i
              className="fa-solid fa-bars"
              style={styles.hamburger}
              onClick={toggleSidebar}
            ></i>
          )}
        </div>
      </div>

      {/* ===== DESKTOP NAV ===== */}
      {!isMobile && (
        <ul style={styles.navLinks}>
          {categories.map((cat) => (
            <li key={cat}>
              <Link
                style={styles.link}
                to={`/category/${encodeURIComponent(cat)}`}
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ===== MOBILE SIDEBAR ===== */}
      {sidebarOpen && (
        <div style={styles.sidebar}>
          <ul style={styles.sidebarLinks}>
            {categories.map((cat) => (
              <li key={cat}>
                <Link
                  style={styles.link}
                  to={`/category/${encodeURIComponent(cat)}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    width: "100%",
    backgroundColor: "white",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    position: "relative",
    zIndex: 10,
  },
  topPart: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    minHeight: "100px",
    flexWrap: "wrap",
  },
  logo: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    flexGrow: 1,
  },
  date: {
    fontSize: "0.9rem",
    color: "#555",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  socialIcons: {
    display: "flex",
    gap: "10px",
    fontSize: "1.2rem",
  },
  hamburger: {
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  navLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    listStyle: "none",
    padding: "10px 0",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: "250px",
    backgroundColor: "white",
    boxShadow: "-2px 0 8px rgba(0,0,0,0.2)",
    paddingTop: "100px",
    zIndex: 20,
  },
  sidebarLinks: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    paddingLeft: "20px",
    fontSize: "1.2rem",
  },
  link: {
    textDecoration: "none",
    color: "black",
    fontWeight: "500",
  },
};

export default Navbar;