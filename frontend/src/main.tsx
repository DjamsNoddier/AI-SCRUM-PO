// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./features/auth/context/AuthContext"
import { Toaster } from "react-hot-toast";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="bottom-right" reverseOrder={false} />
    </AuthProvider>
  </StrictMode>
);
