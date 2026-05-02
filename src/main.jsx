import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import AuthWrapper from "./components/AuthWrapper";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthWrapper> 
          <App />
        </AuthWrapper>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);