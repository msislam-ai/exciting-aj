// src/components/Herosection.jsx
import { useEffect, useState } from "react";
import "./hero.css";
import { fetchAllNews } from "./newsApi"; // connect to your API

const Herosection = () => {
  const [news, setNews] = useState([]);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  /* ================= NEWS FETCH ================= */
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        // Fetch first 5 news articles
        const data = await fetchAllNews(1, 5);
        setNews(data.data || []); // ✅ ensure it's an array
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Failed to fetch news");
      }
    };

    fetchNewsData();
  }, []);

  /* ================= WEATHER FETCH ================= */
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Dhaka&units=metric&appid=0b45a135f1a07d1ecb9216e44edc2e45`
        );
        const data = await res.json();
        if (data.cod === 200) setWeather(data);
      } catch {
        console.log("Weather fetch failed");
      }
    };

    fetchWeather();
  }, []);

  /* ================= LOADING & ERROR ================= */
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

      {/* ===== Weather Card ===== */}
      <div className="weather-card">
        {weather ? (
          <>
            <h3>{weather.name}</h3>
            <img
              src={`https://openweathermap.org/img/wn/${weather?.weather?.[0]?.icon}@2x.png`}
              alt="weather"
            />
            <h1>{Math.round(weather?.main?.temp)}°C</h1>
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
