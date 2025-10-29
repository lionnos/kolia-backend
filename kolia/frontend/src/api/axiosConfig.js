import axios from 'axios';
import { ENDPOINTS } from './endpoints';

// Configuration de base d'Axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Désactivé car nous utilisons Bearer token
});

// Stockage des requêtes en cours pour éviter les doublons
const pendingRequests = new Map();

// Générer une clé unique pour chaque requête
function generateRequestKey(config) {
  return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params)}_${JSON.stringify(config.data)}`;
}

// Intercepteur pour les requêtes (ajout automatique du token)
axiosInstance.interceptors.request.use(
  (config) => {
    // Annuler les requêtes en double
    const requestKey = generateRequestKey(config);
    if (pendingRequests.has(requestKey)) {
      pendingRequests.get(requestKey).abort();
    }
    
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);

    // Ajouter le token d'authentification
    const token = localStorage.getItem('bukavu-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log pour le développement
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
      console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses (gestion globale des erreurs)
axiosInstance.interceptors.response.use(
  (response) => {
    // Nettoyer la requête pending
    const requestKey = generateRequestKey(response.config);
    pendingRequests.delete(requestKey);

    // Log pour le développement
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
      console.log(`✅ API Success: ${response.status} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Nettoyer la requête pending en cas d'erreur
    if (error.config) {
      const requestKey = generateRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    // Gestion centralisée des erreurs
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`❌ API Error ${status}:`, data?.message || error.message);
      
      // Redirection automatique pour les erreurs d'authentification
      if (status === 401) {
        localStorage.removeItem('bukavu-token');
        localStorage.removeItem('bukavu-user');
        
        // Rediriger vers login seulement si on est pas déjà sur la page login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session_expired=true';
        }
      }
      
      // Gestion des erreurs spécifiques
      switch (status) {
        case 403:
          console.error('🚫 Accès refusé');
          break;
        case 404:
          console.error('🔍 Ressource non trouvée');
          break;
        case 429:
          console.error('🚦 Trop de requêtes - Veuillez ralentir');
          break;
        case 500:
          console.error('🚨 Erreur serveur interne');
          break;
        case 502:
        case 503:
        case 504:
          console.error('🌐 Problème de connexion au serveur');
          break;
        default:
          console.error('⚡ Erreur inattendue');
      }
    } else if (error.request) {
      console.error('🌐 Network Error:', 'Impossible de contacter le serveur');
    } else {
      console.error('⚙️ Config Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Méthodes utilitaires
export const apiClient = {
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),
  patch: (url, data = {}, config = {}) => axiosInstance.patch(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
};

// Annuler toutes les requêtes en cours (utile pour les changements de page)
export const cancelAllRequests = () => {
  pendingRequests.forEach((controller, key) => {
    controller.abort();
    pendingRequests.delete(key);
  });
};

export default axiosInstance;