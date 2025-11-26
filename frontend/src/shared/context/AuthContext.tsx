// src/shared/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Récupération éventuelle du token et user stockés
  const storedToken = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!storedToken && !!storedUser
  );

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * 🔄 Synchronisation globale :
   * Lorsque axios détecte un 401 → il émet "auth:logout"
   * Ici on écoute l’évènement et on logout automatiquement.
   */
  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("auth:logout", handleLogoutEvent);
    };
  }, []);

  /**
   * 🔐 Login → sauvegarde du token + user
   */
  const login = (user: User, token: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
  };

  /**
   * 🚪 Logout → nettoie tout + mise à jour du state
   */
  const logout = () => {
    setIsLoggingOut(true); // Empêche RequireAuth d'intervenir pendant la redirection

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);

    // Petit délai pour laisser React nettoyer l'état avant la redirection
    setTimeout(() => {
      window.location.href = "/";
    }, 50);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoggingOut,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
