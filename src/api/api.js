import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
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
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("cprs_token");
      localStorage.removeItem("cprs_user");
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response?.data?.message);
    }

    if (error.response?.status === 404) {
      console.error("Resource not found:", error.response?.data?.message);
    }

    if (error.response?.status >= 500) {
      console.error("Server error:", error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

export default api;
