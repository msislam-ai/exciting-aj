import { useEffect, useState } from "react";
import "./hero.css";
import axios from "axios";

const Herosection = () => {
  const [news, setNews] = useState(null); // 👈 start as null
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const REFRESH_INTERVAL = 7200000; // 2 hours

  /* ================= FETCH DATA ================= */
  const fetchAllData = async () => {
    try {
      setError(null);

      const newsURL =
        "https://banglabartaa.news.girlneed.com/news/all?page=1&limit=5";

      const weatherURL =
        "https://api.openweathermap.org/data/2.5/weather?q=Dhaka&units=metric&appid=0b45a135f1a07d1ecb9216e44edc2e45";

      const [newsRes, weatherRes] = await Promise.all([
        axios.get(newsURL, { timeout: 100000 }),
        fetch(weatherURL),
      ]);

      /* ========= NEWS (SUPER SAFE PARSE) ========= */
      let articles =
        newsRes?.data?.data ||
        newsRes?.data?.articles ||
        newsRes?.data ||
        [];

      if (!Array.isArray(articles)) {
        articles = [];
      }

      console.log("News:", articles);

      setNews(articles);

      /* ========= WEATHER ========= */
      const weatherData = await weatherRes.json();

      if (weatherData?.cod === 200) {
        setWeather(weatherData);
      } else {
        console.warn("Weather error:", weatherData);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Failed to load data");
      setNews([]); // 👈 prevent infinite loading
    }
  };

  /* ================= USE EFFECT ================= */
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (isMounted) {
        await fetchAllData();
      }
    };

    load();

    const interval = setInterval(load, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ================= UI STATES ================= */

  // ❌ Error
  if (error) {
    return <p className="hero-error">{error}</p>;
  }

  // ⏳ Loading
  if (news === null) {
    return <p className="hero-loading">Loading news...</p>;
  }

  // 📭 Empty
  if (news.length === 0) {
    return <p className="hero-empty">No news available</p>;
  }

  const featureNews = news[0];

  /* ================= UI ================= */
  return (
    <section className="hero-container">
      {/* ===== Feature News ===== */}
      <div className="hero-feature">
        {featureNews?.image && (
          <img
            src={featureNews.image}
            alt={featureNews?.title || "news"}
            loading="lazy"
          />
        )}

        <div className="hero-overlay">
          <h2>{featureNews?.title || "No title available"}</h2>
        </div>
      </div>

      {/* ===== Weather ===== */}
      <div className="weather-card">
        {weather ? (
          <>
            <h3>{weather?.name}</h3>

            {weather?.weather?.[0]?.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="weather"
              />
            )}

            <h1>{Math.round(weather?.main?.temp || 0)}°C</h1>
            <p>{weather?.weather?.[0]?.description}</p>
          </>
        ) : (
          <p>Loading weather...</p>
        )}
      </div>
    </section>
  );
};

export default Herosection;
