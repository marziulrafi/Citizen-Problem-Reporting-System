import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cprs_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthMe = url.includes("/auth/me");
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login") &&
      !isAuthMe
    ) {
      localStorage.removeItem("cprs_token");
      localStorage.removeItem("cprs_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
