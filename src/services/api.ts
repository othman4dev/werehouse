import axios from 'axios';
import { API_URL } from '../config/api';

console.log('🌐 Initialisation API avec URL:', API_URL);
console.log('API_URL from env:', process.env.API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur pour le débogage
api.interceptors.request.use(
  config => {
    console.log('📤 Requête sortante:', config.url);
    return config;
  },
  error => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log('📥 Réponse reçue:', response.status);
    return response;
  },
  error => {
    if (error.response) {
      console.error('❌ Erreur serveur:', error.response.status);
      console.error('📄 Données:', error.response.data);
    } else if (error.request) {
      console.error('❌ Erreur réseau:', error.message);
    } else {
      console.error('❌ Erreur:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 