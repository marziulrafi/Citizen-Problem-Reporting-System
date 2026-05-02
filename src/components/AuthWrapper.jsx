import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthWrapper({ children }) {
  const navigate = useNavigate();
  const { setNavigate } = useAuth();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);

  return <>{children}</>;
}