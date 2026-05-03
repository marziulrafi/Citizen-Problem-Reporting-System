import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

function rolesMatch(userRole, requiredRole) {
  return (
    String(userRole ?? "").trim().toLowerCase() ===
    String(requiredRole ?? "").trim().toLowerCase()
  );
}

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !rolesMatch(user.role, requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}