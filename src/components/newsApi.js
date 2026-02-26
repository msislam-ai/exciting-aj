// src/api/newsApi.js

const BASE_URL = "https://news-project-06582-2.onrender.com/news/all";

/* =========================
   Fetch All News
========================= */
export const fetchAllNews = async () => {
  try {
    const res = await fetch(`${BASE_URL}/news/all`);

    if (!res.ok) {
      throw new Error("Failed to fetch news");
    }

    return await res.json();
  } catch (error) {
    console.error("❌ fetchAllNews:", error.message);
    return [];
  }
};

/* =========================
   Fetch News By Category
========================= */
export const fetchNewsByCategory = async (category) => {
  try {
    const res = await fetch(
      `${BASE_URL}/news/category/${encodeURIComponent(category)}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch category news");
    }

    return await res.json();
  } catch (error) {
    console.error("❌ fetchNewsByCategory:", error.message);
    return [];
  }
};

/* =========================
   Fetch Latest News
========================= */
export const fetchLatestNews = async () => {
  try {
    const res = await fetch(`${BASE_URL}/news/latest`);

    if (!res.ok) {
      throw new Error("Failed to fetch latest news");
    }

    return await res.json();
  } catch (error) {
    console.error("❌ fetchLatestNews:", error.message);
    return [];
  }
};

/* =========================
   Search News
========================= */
export const searchNews = async (query) => {
  try {
    const res = await fetch(
      `${BASE_URL}/news/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      throw new Error("Search failed");
    }

    return await res.json();
  } catch (error) {
    console.error("❌ searchNews:", error.message);
    return [];
  }
};
