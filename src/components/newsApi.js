const BASE_URL = "https://banglabartaa.news.girlneed.com";

/* =========================
   Fetch All News (paginated)
========================= */
export const fetchAllNews = async (page = 1, limit = 50) => {
  try {
    const res = await fetch(`${BASE_URL}/news/all?page=${page}&limit=${limit}`);

    if (!res.ok) throw new Error("Failed to fetch news");

    const json = await res.json();

    // Ensure consistent structure
    return {
      page: json.page || page,
      limit: json.limit || limit,
      total: json.total || 0,
      totalPages: json.totalPages || 0,
      data: Array.isArray(json.data) ? json.data : [],
    };
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

    if (!res.ok) throw new Error("Failed to fetch category news");

    const json = await res.json();

    return {
      page: json.page || page,
      limit: json.limit || limit,
      total: json.total || 0,
      totalPages: json.totalPages || 0,
      data: Array.isArray(json.data) ? json.data : [],
    };
  } catch (error) {
    console.error("❌ fetchNewsByCategory:", error.message);
    return { page, limit, total: 0, totalPages: 0, data: [] };
  }
};

/* =========================
   Fetch Latest News (latest 10 news)
========================= */
export const fetchLatestNews = async () => {
  try {
    const res = await fetch(`${BASE_URL}/news/latest`);

    if (!res.ok) throw new Error("Failed to fetch latest news");

    const data = await res.json();

    return {
      page: 1,
      limit: data.length || 0,
      total: data.length || 0,
      totalPages: 1,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("❌ fetchLatestNews:", error.message);
    return { page: 1, limit: 0, total: 0, totalPages: 0, data: [] };
  }
};

/* =========================
   Search News
========================= */
export const searchNews = async (query, page = 1, limit = 50) => {
  try {
    const res = await fetch(
      `${BASE_URL}/news/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );

    if (!res.ok) throw new Error("Search failed");

    const json = await res.json();

    return {
      page: json.page || page,
      limit: json.limit || limit,
      total: json.total || 0,
      totalPages: json.totalPages || 0,
      data: Array.isArray(json.data) ? json.data : [],
    };
  } catch (error) {
    console.error("❌ searchNews:", error.message);
    return { page, limit, total: 0, totalPages: 0, data: [] };
  }
};
