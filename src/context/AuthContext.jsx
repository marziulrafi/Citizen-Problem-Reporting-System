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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigateRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("cprs_user");
    const token = localStorage.getItem("cprs_token");
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        localStorage.removeItem("cprs_user");
        localStorage.removeItem("cprs_token");
      }
    }
    setLoading(false);
  }, []);

  const loginWithAPI = async (email, password) => {
    try {
      setIsAuthLoading(true);
      const response = await authService.login(email, password);

      const token = response?.data?.token || response?.token;
      const userData = response?.data?.user || response?.data;

      if (response.success && token && userData) {
        setUser(userData);
        localStorage.setItem("cprs_token", token);
        localStorage.setItem("cprs_user", JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name || email.split("@")[0]}!`);
        
        if (navigateRef.current) {
          if (userData.role === "admin") {
            navigateRef.current("/admin");
          } else {
            navigateRef.current("/");
          }
        }
        return { success: true };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const registerWithAPI = async (userData) => {
    try {
      setIsAuthLoading(true);
      const response = await authService.register(userData);

      const token = response?.data?.token || response?.token;
      const user = response?.data?.user || response?.data;

      if (response.success && token && user) {
        setUser(user);
        localStorage.setItem("cprs_token", token);
        localStorage.setItem("cprs_user", JSON.stringify(user));
        toast.success("Account created successfully!");
        
        if (navigateRef.current) {
          if (user.role === "admin") {
            navigateRef.current("/admin");
          } else {
            navigateRef.current("/");
          }
        }
        return { success: true };
      } else {
        throw new Error(response.message || "Registration failed");
      }
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
    <AuthContext.Provider value={{
      user,
      login: loginWithAPI,
      register: registerWithAPI,
      logout,
      loading,
      isAuthLoading,
      setNavigate,
    }}>
      {children}
    </AuthContext.Provider>
  );
};