import { useEffect, useState } from "react";
import "./hero.css";
import axios from "axios";

const Herosection = () => {
  const [news, setNews] = useState([]);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  // ✅ 2 hours = 7200000 ms
  const REFRESH_INTERVAL = 7200000;

  /* ================= FETCH BOTH DATA ================= */
  const fetchAllData = async () => {
    try {
      const [newsRes, weatherRes] = await Promise.all([
        axios.get(
          "https://banglabartaa.news.girlneed.com"
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Dhaka&units=metric&appid=0b45a135f1a07d1ecb9216e44edc2e45`
        )
      ]);

      // ✅ News
      const articles = Array.isArray(newsRes.data.data)
        ? newsRes.data.data
        : newsRes.data || [];
      setNews(articles);

      // ✅ Weather
      const weatherData = await weatherRes.json();
      if (weatherData.cod === 200) {
        setWeather(weatherData);
      }

      setError(null);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Failed to load data");
    }
  };

  /* ================= USE EFFECT ================= */
  useEffect(() => {
    fetchAllData();

    const interval = setInterval(fetchAllData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  /* ================= UI ================= */
  if (error) return <p className="hero-error">{error}</p>;
  if (!news.length) return <p className="hero-loading">Loading news...</p>;

  const featureNews = news[0];

  return (
    <section className="hero-container">
      {/* ===== Feature News ===== */}
      <div className="hero-feature">
        {featureNews?.image && (
          <img src={featureNews.image} alt={featureNews.title} />
        )}
        <div className="hero-overlay">
          <h2>{featureNews?.title}</h2>
        </div>
      </div>

      {/* ===== Weather ===== */}
      <div className="weather-card">
        {weather ? (
          <>
            <h3>{weather.name}</h3>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}@2x.png`}
              alt="weather"
            />
            <h1>{Math.round(weather.main?.temp)}°C</h1>
            <p>{weather.weather?.[0]?.description}</p>
          </>
        ) : (
          <p>Loading weather...</p>
        )}
      </div>
    </section>
  );
};

export default Herosection;
