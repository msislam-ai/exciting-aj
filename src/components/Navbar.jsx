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
  const closeSidebar = () => setSidebarOpen(false);

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

  // Prevent scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";
  }, [sidebarOpen]);

  return (
    <nav style={styles.navbar}>
      {/* ===== TOP BAR ===== */}
      <div style={styles.topPart}>
        
        {/* LEFT MENU BUTTON */}
        <div style={styles.left}>
          {isMobile && (
            <i
              className="fa-solid fa-bars"
              style={styles.hamburger}
              onClick={toggleSidebar}
            ></i>
          )}
        </div>

        {/* CENTER LOGO */}
        <div style={styles.center}>
          <h2 style={styles.logo}>বাংলা বার্তা</h2>
          {!isMobile && <p style={styles.date}>{banglaDate}</p>}
        </div>

        {/* RIGHT SOCIAL (DESKTOP ONLY) */}
        <div style={styles.right}>
          {!isMobile && (
            <div style={styles.socialIcons}>
              <a href="#"><i className="fa-brands fa-youtube"></i></a>
              <a href="#"><i className="fa-brands fa-linkedin"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-facebook"></i></a>
            </div>
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

      {/* ===== OVERLAY ===== */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={closeSidebar}></div>
      )}

      {/* ===== SIDEBAR ===== */}
      <div
        style={{
          ...styles.sidebar,
          transform: sidebarOpen
            ? "translateX(0)"
            : "translateX(100%)",
        }}
      >
        <div style={styles.closeWrapper}>
          <i
            className="fa-solid fa-xmark"
            style={styles.closeBtn}
            onClick={closeSidebar}
          ></i>
        </div>

        <ul style={styles.sidebarLinks}>
          {categories.map((cat) => (
            <li key={cat}>
              <Link
                style={styles.link}
                to={`/category/${encodeURIComponent(cat)}`}
                onClick={closeSidebar}
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>

        {/* MOBILE SOCIAL */}
        <div style={styles.sidebarSocial}>
          <a href="#"><i className="fa-brands fa-youtube"></i></a>
          <a href="#"><i className="fa-brands fa-linkedin"></i></a>
          <a href="#"><i className="fa-brands fa-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-facebook"></i></a>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  /* ✅ STICKY NAVBAR */
  navbar: {
    position: "sticky",
    top: 0,
    width: "100%",
    backgroundColor: "white",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    zIndex: 999,
  },

  /* TOP BAR */
  topPart: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    padding: "15px 20px",
  },

  left: {
    display: "flex",
    alignItems: "center",
  },

  center: {
    textAlign: "center",
  },

  right: {
    display: "flex",
    justifyContent: "flex-end",
  },

  logo: {
    fontSize: "2rem",
    fontWeight: "bold",
    margin: 0,
  },

  date: {
    fontSize: "0.85rem",
    color: "#555",
    marginTop: "4px",
  },

  hamburger: {
    fontSize: "1.6rem",
    cursor: "pointer",
  },

  socialIcons: {
    display: "flex",
    gap: "12px",
    fontSize: "1.2rem",
  },

  navLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    listStyle: "none",
    padding: "10px 0",
  },

  link: {
    textDecoration: "none",
    color: "black",
    fontWeight: "500",
    fontSize: "1.1rem",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 998,
  },

  sidebar: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: "270px",
    backgroundColor: "white",
    boxShadow: "-2px 0 10px rgba(0,0,0,0.25)",
    transition: "transform 0.35s ease",
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
  },

  closeWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "20px",
  },

  closeBtn: {
    fontSize: "1.6rem",
    cursor: "pointer",
  },

  sidebarLinks: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    paddingLeft: "25px",
    fontSize: "1.2rem",
  },

  sidebarSocial: {
    marginTop: "auto",
    marginBottom: "40px",
    display: "flex",
    justifyContent: "center",
    gap: "22px",
    fontSize: "1.5rem",
  },
};

export default Navbar;
