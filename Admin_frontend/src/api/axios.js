import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }

    // 403: Permission Denied -> GO TO DASHBOARD (Don't Logout)
    if (status === 403) {
      // Optional: Show an alert
      //  alert("You do not have permission to perform this action.");
      
      // If you want to redirect them away from the current page:
      // window.location.href = "/admin/dashboard"; 
      
      // OR just let them stay on the page and see the error alert (Better UX)
    }
    return Promise.reject(err);
  }
);

export default api;

