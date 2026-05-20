import Navbar from "./components/Navbar";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
      <AppRoutes />
    </>
  );
}
