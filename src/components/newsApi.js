const BASE_URL = "https://news-project-06582-2.onrender.com";

/* =========================
   Fetch All News (paginated)
========================= */
export const fetchAllNews = async (page = 1, limit = 50) => {
  try {
    const res = await fetch(`${BASE_URL}/news/all?page=${page}&limit=${limit}`);

    if (!res.ok) {
      throw new Error("Failed to fetch news");
    }

    return await res.json(); // returns { page, limit, total, totalPages, data }
  } catch (error) {
    console.error("❌ fetchAllNews:", error.message);
    return { page, limit, total: 0, totalPages: 0, data: [] };
  }
};

/* =========================
   Fetch News By Category (paginated)
========================= */
export const fetchNewsByCategory = async (category, page = 1, limit = 50) => {
  try {
    const res = await fetch(
      `${BASE_URL}/news/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch category news");
    }

    return await res.json(); // returns { page, limit, total, totalPages, data }
  } catch (error) {
    console.error("❌ fetchNewsByCategory:", error.message);
    return { page, limit, total: 0, totalPages: 0, data: [] };
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
