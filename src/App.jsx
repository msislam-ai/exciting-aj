// src/App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FullPageLoader from "./components/FullPageLoader";
import Herosection from "./components/Herosection";
import Newsbar from "./components/Newsbar";
import CategorySection from "./components/CategorySection";
import NewsSection from "./components/NewsSection";
import AllNewsPage from "./components/AllNewsPage"; // <-- added AllNewsPage
import CategoryPage from "./components/CategoryPage";
import ArticlePage from "./components/ArticlePage";

import "./App.css";

function App() {
  const [homeLoading, setHomeLoading] = useState(true);

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <FullPageLoader loading={homeLoading} setLoading={setHomeLoading}>
              <Herosection />
              <Newsbar />
              <CategorySection />
              <NewsSection />
            </FullPageLoader>
          }
        />

        {/* All News Page */}
        <Route path="/all-news" element={<AllNewsPage />} />

        {/* Dynamic Category Page */}
        <Route path="/category/:categoryName" element={<CategoryPage />} />

        {/* Dynamic Article Page */}
        <Route path="/article/:id" element={<ArticlePage />} />

        {/* Fallback 404 Page */}
        <Route
          path="*"
          element={
            <div style={{ padding: "50px", textAlign: "center" }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
