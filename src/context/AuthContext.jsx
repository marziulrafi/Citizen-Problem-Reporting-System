import { createContext, useContext, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

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
  const navigateRef = useRef(null); // Use ref to avoid re-renders

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("cprs_user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (email, userData) => {
    setUser(userData);
    localStorage.setItem("cprs_user", JSON.stringify(userData));
    toast.success(`Welcome back, ${userData.name || email.split("@")[0]}!`);
    
    // Use ref instead of state for navigation
    if (navigateRef.current) {
      if (userData.role === "admin") {
        navigateRef.current("/admin");
      } else {
        navigateRef.current("/");
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cprs_user");
    toast.success("Logged out successfully");
    
    // Use ref instead of state for navigation
    if (navigateRef.current) {
      navigateRef.current("/login");
    }
  };

  // This function sets the navigate function without causing re-renders
  const setNavigate = (navigate) => {
    navigateRef.current = navigate;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setNavigate }}>
      {children}
    </AuthContext.Provider>
  );
};