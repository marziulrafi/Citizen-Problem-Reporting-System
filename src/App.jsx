import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Report from "./pages/Report";
import ProblemDetails from "./pages/ProblemDetails";
import MyReports from "./pages/MyReports";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Navbar />
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problem/:id" element={<ProblemDetails />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - require login */}
        <Route path="/report" element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        } />
        
        <Route path="/my-reports" element={
          <ProtectedRoute>
            <MyReports />
          </ProtectedRoute>
        } />
        
        {/* Admin only route */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}