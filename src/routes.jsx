import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Report from "./pages/Report";
import ProblemDetails from "./pages/ProblemDetails";
import MyReports from "./pages/MyReports";
import AdminDashboard from "./pages/AdminDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import FieldWorkerDashboard from "./pages/FieldWorkerDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/problems" element={<Problems />} />
      <Route path="/problem/:id" element={<ProblemDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRoles={["citizen", "admin"]}>
            <Report />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-reports"
        element={
          <ProtectedRoute allowedRoles={["citizen", "admin"]}>
            <MyReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority"
        element={
          <ProtectedRoute requiredRole="authority">
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker"
        element={
          <ProtectedRoute requiredRole="field_worker">
            <FieldWorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moderator"
        element={
          <ProtectedRoute requiredRole="moderator">
            <ModeratorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
