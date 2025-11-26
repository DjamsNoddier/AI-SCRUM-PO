// src/shared/components/RequireAuth.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoggingOut } = useAuth();

  // ⛔ Empêche le flash de /login lorsqu'on se déconnecte
  if (isLoggingOut) {
    return null; // ou un loader
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
