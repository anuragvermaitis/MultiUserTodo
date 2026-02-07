import axios from "axios";
import { clearToken, getStoredToken, getAuthToken, refreshToken } from "../auth/authSession";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: false,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const requestUrl = err.config?.url || "";
      if (requestUrl.includes("/auth/me")) {
        return Promise.reject(err);
      }

      const token = getStoredToken();
      const originalRequest = err.config || {};

      if (token && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const freshToken = await refreshToken();
          if (freshToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          // fall through to logout flow
        }
      }

      clearToken();
      try {
        const current = window.location && window.location.pathname;
        if (current !== "/login" && current !== "/register") {
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
