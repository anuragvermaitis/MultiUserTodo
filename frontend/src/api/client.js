import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 🔑 REQUIRED
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      try {
        const current = window.location && window.location.pathname;
        if (current !== "/login") {
          window.location.href = "/login";
        }
      } catch (e) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
