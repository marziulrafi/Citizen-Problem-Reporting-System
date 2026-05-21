import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function AuthWrapper({ children }) {
  const navigate = useNavigate();
  const { setNavigate } = useAuth();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);

  return <>{children}</>;
}