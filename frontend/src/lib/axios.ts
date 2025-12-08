// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // 🔥 envoie les cookies avec chaque requête
});

export default api;
