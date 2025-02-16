import axios from 'axios';

let currentApiUrl = process.env.API_URL;

const getApiUrl = () => {
  if (__DEV__) {
    console.log('📱 Mode développement détecté');
    console.log('🔍 Lecture de API_URL:', process.env.API_URL);
    
    if (!currentApiUrl) {
      console.error('❌ API_URL non définie dans .env');
      return 'http://localhost:3000';
    }
    
    console.log('🌐 URL API utilisée:', currentApiUrl);
    return currentApiUrl;
  }
  return 'https://api.production.com';
};

// Création de l'instance axios
export const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
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
      console.error('🔴 Erreur API:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('🔴 Pas de réponse du serveur');
    } else {
      console.error('🔴 Erreur:', error.message);
    }
    return Promise.reject(error);
  }
);

// Fonction pour mettre à jour l'URL de l'API
export const updateApiUrl = (newUrl: string) => {
  console.log('🔄 Mise à jour URL API:', newUrl);
  currentApiUrl = newUrl;
  api.defaults.baseURL = newUrl;
};

export const API_URL = getApiUrl(); 