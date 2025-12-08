// src/shared/components/RequireAuth.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  // ⏳ Tant qu'on ne sait pas si le token est valide → NE RIEN RENDRE
  if (isLoading) return null;

  // ❌ Si pas connecté → redirect HOME (pas login)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
