// src/features/auth/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../../../lib/axios";

type AuthUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔁 Au chargement : essayer de récupérer la session via /auth/me
  useEffect(() => {
    async function bootstrap() {
      try {
        const res = await api.get("/auth/me");
        setUser({ id: res.data.id, email: res.data.email });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, []);

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      // Les cookies sont posés par le backend, on ne manipule pas les tokens ici.
      setUser({ id: res.data.user.id, email: res.data.user.email });
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // pas grave en MVP
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
