import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDashboardPath } from "../utils/roles";
import Loader from "./Loader";

function rolesMatch(userRole, requiredRole) {
  return String(userRole ?? "").trim().toLowerCase() === String(requiredRole ?? "").trim().toLowerCase();
}

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && !rolesMatch(user.role, requiredRole)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}
