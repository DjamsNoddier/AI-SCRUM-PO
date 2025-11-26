import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
  timeout: 60_000, // 1 minute
  headers: {
    Accept: "application/json",
  },
});

// 🔐 Intercepteur pour ajouter automatiquement le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔍 Intercepteur de réponse : gestion des erreurs + session expirée
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 🎯 Cas particulier : token expiré / non valide
    if (status === 401) {
      console.warn("🔐 Session expirée ou non autorisée → logout + redirection /");

      // 1. Nettoyer le stockage local (sécurité)
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      // 2. Prévenir le AuthContext (pour mettre isAuthenticated = false)
      try {
        const authEvent = new Event("auth:logout");
        window.dispatchEvent(authEvent);
      } catch (e) {
        console.error("⚠️ Impossible d'émettre l'évènement auth:logout", e);
      }

      // 3. Rediriger vers la Home (page publique de présentation)
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    // Log générique des erreurs API
    console.error("❌ API Error:", error.response?.data || error.message);

    return Promise.reject(error);
  }
);

export default api;
