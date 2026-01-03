import axios from "axios";

// --- 1. SMART BASE URL ---
// If we are on Vercel, it uses the hidden environment variable.
// If we are on Localhost, it uses port 8000.
// We append "/api" because your backend routes start with /api
const BASE_URL = (import.meta.env.VITE_API_URL || "https://divyaveda.onrender.com") + "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true // Matches the CORS setting we added to Backend
});

// --- 2. REQUEST INTERCEPTOR (Attach Token) ---
api.interceptors.request.use(config => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- 3. RESPONSE INTERCEPTOR (Handle Errors) ---
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    
    // 401: Unauthorized -> Force Logout
    if (status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }

    // 403: Forbidden -> Stay on page (Optional: Show Alert)
    if (status === 403) {
      console.warn("Permission Denied: You do not have access.");
    }

    return Promise.reject(err);
  }
);

export default api;