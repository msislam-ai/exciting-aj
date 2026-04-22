const BASE_URL = "https://banglabartaa.news.girlneed.com/api/news";

/* =========================
   Fetch Latest News
========================= */
export const fetchLatestNews = async (limit = 10) => {
  try {
    const res = await fetch(`${BASE_URL}/latest?limit=${limit}`);

    if (!res.ok) throw new Error("Failed to fetch latest news");

    const data = await res.json();

    return {
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("❌ fetchLatestNews:", error.message);
    return { data: [] };
  }
};

/* =========================
   Fetch News By Category
========================= */
export const fetchNewsByCategory = async (category, limit = 50) => {
  try {
    const res = await fetch(
      `${BASE_URL}/category/${encodeURIComponent(category)}?limit=${limit}`
    );

    if (!res.ok) throw new Error("Failed to fetch category news");

    const data = await res.json();

    return {
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("❌ fetchNewsByCategory:", error.message);
    return { data: [] };
  }
};

/* =========================
   Fetch Single Article
========================= */
export const fetchSingleArticle = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/article/${id}`);

    if (!res.ok) throw new Error("Failed to fetch article");

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("❌ fetchSingleArticle:", error.message);
    return null;
  }
};

/* =========================
   Fetch Categories
========================= */
export const fetchCategories = async () => {
  try {
    const res = await fetch(`${BASE_URL}/categories`);

    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ fetchCategories:", error.message);
    return [];
  }
};
