import Navbar from "./components/Navbar";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Navbar />
      <Toaster />
      <AppRoutes />
    </>
  );
}