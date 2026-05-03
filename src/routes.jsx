import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Report from "./pages/Report";
import ProblemDetails from "./pages/ProblemDetails";
import MyReports from "./pages/MyReports";
import AdminDashboard from "./pages/AdminDashboard";
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
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
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
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
