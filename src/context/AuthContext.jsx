import { createContext, useContext, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { authService } from "../api/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const normalizeUser = (u) => {
  if (!u || typeof u !== "object") return null;
  const id = u._id ?? u.id;
  if (id == null || id === "") return null;
  const email = typeof u.email === "string" ? u.email.trim() : "";
  if (!email) return null;
  const rawRole = String(u.role ?? "").trim().toLowerCase();
  const role = rawRole === "admin" ? "admin" : "citizen";
  return {
    _id: id,
    id: String(id),
    name: u.name,
    email,
    role,
  };
};

export const isAdminRole = (userOrRole) => {
  const r =
    typeof userOrRole === "string"
      ? userOrRole
      : userOrRole?.role;
  return String(r ?? "").trim().toLowerCase() === "admin";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigateRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      const token = localStorage.getItem("cprs_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        if (cancelled) return;
        if (res.success && res.data?.user) {
          const u = normalizeUser(res.data.user);
          if (u) {
            setUser(u);
            localStorage.setItem("cprs_user", JSON.stringify(u));
          } else {
            throw new Error("Invalid user payload");
          }
        } else {
          throw new Error(res.message || "Session invalid");
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem("cprs_token");
          localStorage.removeItem("cprs_user");
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithAPI = async (email, password) => {
    try {
      setIsAuthLoading(true);
      const response = await authService.login(email, password);
      const data = response?.data;
      const token = data?.token;
      const userData = normalizeUser(data?.user);

      if (response.success && token && userData) {
        setUser(userData);
        localStorage.setItem("cprs_token", token);
        localStorage.setItem("cprs_user", JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name || email.split("@")[0]}!`);

        const dest = isAdminRole(userData) ? "/dashboard" : "/";
        navigateRef.current?.(dest);

        return { success: true, user: userData };
      }
      throw new Error(response.message || "Login failed");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const registerWithAPI = async (payload) => {
    try {
      setIsAuthLoading(true);
      const response = await authService.register(payload);
      const data = response?.data;
      const token = data?.token;
      const nextUser = normalizeUser(data?.user);

      if (response.success && token && nextUser) {
        setUser(nextUser);
        localStorage.setItem("cprs_token", token);
        localStorage.setItem("cprs_user", JSON.stringify(nextUser));
        toast.success("Account created successfully!");

        const dest = isAdminRole(nextUser) ? "/dashboard" : "/";
        navigateRef.current?.(dest);

        return { success: true, user: nextUser };
      }
      throw new Error(response.message || "Registration failed");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Registration failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cprs_user");
    localStorage.removeItem("cprs_token");
    toast.success("Logged out successfully");

    if (navigateRef.current) {
      navigateRef.current("/login");
    }
  };

  const setNavigate = (navigate) => {
    navigateRef.current = navigate;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: loginWithAPI,
        register: registerWithAPI,
        logout,
        loading,
        isAuthLoading,
        setNavigate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
