import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { authService } from "../api/authService";
import { getDashboardPath } from "../utils/roles";
import { normalizeUser } from "../utils/authHelpers";
import { AuthContext } from "./authContextObject";

export default function AuthProvider({ children }) {
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
        const payload = res.data?.user ?? res.data;
        if (res.success && payload) {
          const u = normalizeUser(payload);
          if (u) {
            setUser(u);
            localStorage.setItem("cprs_user", JSON.stringify(u));
          } else throw new Error("Invalid user payload");
        } else throw new Error(res.message || "Session invalid");
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
    return () => { cancelled = true; };
  }, []);

  const handleAuthSuccess = (response) => {
    const data = response?.data;
    const token = data?.token;
    const userData = normalizeUser(data?.user);
    if (response.success && token && userData) {
      setUser(userData);
      localStorage.setItem("cprs_token", token);
      localStorage.setItem("cprs_user", JSON.stringify(userData));
      return userData;
    }
    return null;
  };

  const loginWithAPI = async (email, password, expectedRole = null) => {
    try {
      setIsAuthLoading(true);
      const response = await authService.login(email, password);
      const userData = handleAuthSuccess(response);

      if (userData) {
        if (expectedRole && userData.role !== expectedRole) {
          localStorage.removeItem("cprs_token");
          localStorage.removeItem("cprs_user");
          setUser(null);
          const roleNames = {
            citizen: "Citizen",
            field_worker: "Worker Team",
            authority: "Authority",
            moderator: "Moderator",
            admin: "Administrator",
          };
          toast.error(
            `This email is not a ${roleNames[expectedRole] || expectedRole} account. Check role and zone email.`
          );
          return { success: false, error: "Role mismatch" };
        }
        toast.success(`Welcome back, ${userData.name || email.split("@")[0]}!`);
        navigateRef.current?.(getDashboardPath(userData.role));
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
      const response = await authService.register({ ...payload, role: "citizen" });
      const userData = handleAuthSuccess(response);

      if (userData) {
        toast.success("Account created successfully!");
        navigateRef.current?.(getDashboardPath(userData.role));
        return { success: true, user: userData };
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
    navigateRef.current?.("/login");
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
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
