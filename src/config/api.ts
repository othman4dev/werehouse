import axios from "axios";

// Création de l'instance axios
export const api = axios.create({
  baseURL: process.env.API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Vous pouvez ajouter ici un token d'authentification si nécessaire
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        "🔴 Erreur API:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("🔴 Pas de réponse du serveur");
    } else {
      console.error("🔴 Erreur:", error.message);
    }
    return Promise.reject(error);
  }
);

// Fonction pour mettre à jour l'URL de l'API
export const updateApiUrl = (newUrl: string) => {
  console.log("🔄 Mise à jour URL API:", newUrl);
  currentApiUrl = newUrl;
  api.defaults.baseURL = newUrl;
};

export const API_URL = process.env.API_URL;
