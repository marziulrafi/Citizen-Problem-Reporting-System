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
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
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
    const payload = error.response?.data;
    const message =
      (typeof payload === "object" && payload?.message) ||
      error.message ||
      "Request failed";

    error.apiMessage = message;
    error.apiPayload = payload;

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
