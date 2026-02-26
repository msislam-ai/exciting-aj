import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/icon111.jpg";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FullPageLoader from "./components/FullPageLoader";
import "./App.css";
import "./components/Navbar";
import Navbar from "./components/Navbar";
import Herosection from "./components/herosection";
import Newsbar from "./components/Newsbar";
import CategorySection from "./components/CategorySection";
import NewsSection from "./components/NewsSection";
import Footer from "./components/Footer";
import CategoryPage from "./components/CategoryPage";
import ArticlePage from "./components/ArticlePage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
            <FullPageLoader>
              <Herosection />
              <Newsbar />
              <CategorySection />
              <NewsSection />
              </FullPageLoader>
            </>
          }
        />

        {/* Dynamic Category Page */}
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        {/* Dynamic Article Page */}
        <Route path="/article/:id" element={<ArticlePage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
