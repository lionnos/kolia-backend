import axiosInstance, { apiClient, cancelAllRequests } from './axiosConfig';
import { ENDPOINTS } from './endpoints';

// Service d'authentification
export const authAPI = {
  login: (credentials) => 
    apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials),
  
  register: (userData) => 
    apiClient.post(ENDPOINTS.AUTH.REGISTER, userData),
  
  logout: () => 
    apiClient.post(ENDPOINTS.AUTH.LOGOUT),
  
  getProfile: () => 
    apiClient.get(ENDPOINTS.AUTH.PROFILE),
  
  refreshToken: () => 
    apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN),
  
  forgotPassword: (email) => 
    apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  
  resetPassword: (token, newPassword) => 
    apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword }),
};

// Service des utilisateurs
export const userAPI = {
  getProfile: () => 
    apiClient.get(ENDPOINTS.USERS.PROFILE),
  
  updateProfile: (userData) => 
    apiClient.put(ENDPOINTS.USERS.UPDATE_PROFILE, userData),
  
  updatePassword: (passwordData) => 
    apiClient.patch(ENDPOINTS.USERS.UPDATE_PASSWORD, passwordData),
  
  getUserById: (id) => 
    apiClient.get(ENDPOINTS.USERS.BY_ID(id)),
};

// Service des restaurants
export const restaurantAPI = {
  // ✅ REMPLACE votre fonction getRestaurants existante
  getAll: (filters = {}) => 
    apiClient.get(ENDPOINTS.RESTAURANTS.BASE, { params: filters }),
  
  // ✅ REMPLACE votre fonction getRestaurantById existante
  getById: (id) => 
    apiClient.get(ENDPOINTS.RESTAURANTS.BY_ID(id)),
  
  getByOwner: () => 
    apiClient.get(ENDPOINTS.RESTAURANTS.BY_OWNER),
  
  search: (query, filters = {}) => 
    apiClient.get(ENDPOINTS.RESTAURANTS.SEARCH, { 
      params: { q: query, ...filters } 
    }),
  
  getNearby: (latitude, longitude, radius = 5000) => 
    apiClient.get(ENDPOINTS.RESTAURANTS.NEARBY, {
      params: { lat: latitude, lng: longitude, radius }
    }),
  
  create: (restaurantData) => 
    apiClient.post(ENDPOINTS.RESTAURANTS.BASE, restaurantData),
  
  update: (id, restaurantData) => 
    apiClient.put(ENDPOINTS.RESTAURANTS.BY_ID(id), restaurantData),
  
  delete: (id) => 
    apiClient.delete(ENDPOINTS.RESTAURANTS.BY_ID(id)),
};

// Service des plats
export const dishAPI = {
  getByRestaurant: (restaurantId) => 
    apiClient.get(ENDPOINTS.DISHES.BY_RESTAURANT(restaurantId)),
  
  getById: (id) => 
    apiClient.get(ENDPOINTS.DISHES.BY_ID(id)),
  
  search: (query, filters = {}) => 
    apiClient.get(ENDPOINTS.DISHES.SEARCH, { 
      params: { q: query, ...filters } 
    }),
  
  getCategories: () => 
    apiClient.get(ENDPOINTS.DISHES.CATEGORIES),
  
  create: (dishData) => 
    apiClient.post(ENDPOINTS.DISHES.BASE, dishData),
  
  update: (id, dishData) => 
    apiClient.put(ENDPOINTS.DISHES.BY_ID(id), dishData),
  
  delete: (id) => 
    apiClient.delete(ENDPOINTS.DISHES.BY_ID(id)),
};

// Service des commandes
export const orderAPI = {
  // ✅ REMPLACE votre fonction createOrder existante
  create: (orderData) => 
    apiClient.post(ENDPOINTS.ORDERS.BASE, orderData),
  
  getById: (id) => 
    apiClient.get(ENDPOINTS.ORDERS.BY_ID(id)),
  
  getUserOrders: () => 
    apiClient.get(ENDPOINTS.ORDERS.USER),
  
  getRestaurantOrders: () => 
    apiClient.get(ENDPOINTS.ORDERS.RESTAURANT),
  
  getDriverOrders: () => 
    apiClient.get(ENDPOINTS.ORDERS.DRIVER),
  
  updateStatus: (id, status) => 
    apiClient.patch(ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status }),
  
  track: (id) => 
    apiClient.get(ENDPOINTS.ORDERS.TRACK(id)),
  
  cancel: (id) => 
    apiClient.delete(ENDPOINTS.ORDERS.BY_ID(id)),
};

// Service des paiements
export const paymentAPI = {
  process: (paymentData) => 
    apiClient.post(ENDPOINTS.PAYMENTS.PROCESS, paymentData),
  
  verify: (id) => 
    apiClient.get(ENDPOINTS.PAYMENTS.VERIFY(id)),
  
  getHistory: () => 
    apiClient.get(ENDPOINTS.PAYMENTS.HISTORY),
};

// Service d'upload
export const uploadAPI = {
  uploadAvatar: (formData) => 
    apiClient.post(ENDPOINTS.UPLOAD.AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  uploadDishImage: (formData) => 
    apiClient.post(ENDPOINTS.UPLOAD.DISH_IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  uploadRestaurantImage: (formData) => 
    apiClient.post(ENDPOINTS.UPLOAD.RESTAURANT_IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Service des notifications
export const notificationAPI = {
  getUserNotifications: () => 
    apiClient.get(ENDPOINTS.NOTIFICATIONS.BY_USER),
  
  markAsRead: (id) => 
    apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  
  markAllAsRead: () => 
    apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
};

// Service des livreurs
export const driverAPI = {
  getProfile: () => 
    apiClient.get(ENDPOINTS.DRIVERS.PROFILE),
  
  getAvailableOrders: () => 
    apiClient.get(ENDPOINTS.DRIVERS.AVAILABLE_ORDERS),
  
  acceptOrder: (orderId) => 
    apiClient.post(ENDPOINTS.DRIVERS.ACCEPT_ORDER(orderId)),
  
  updateLocation: (locationData) => 
    apiClient.patch(ENDPOINTS.DRIVERS.PROFILE, locationData),
};

// ✅ Fonctions de compatibilité - gardez vos anciens noms de fonctions pour éviter de casser le code existant
export const getRestaurants = restaurantAPI.getAll;
export const getRestaurantById = restaurantAPI.getById;
export const createOrder = orderAPI.create;
export const loginUser = authAPI.login;
export const registerUser = authAPI.register;

// ✅ Export par défaut de tous les services
export default {
  auth: authAPI,
  user: userAPI,
  restaurant: restaurantAPI,
  dish: dishAPI,
  order: orderAPI,
  payment: paymentAPI,
  upload: uploadAPI,
  notification: notificationAPI,
  driver: driverAPI,
  
  // Utilitaires
  cancelAllRequests,
};

// ✅ Export de l'instance axios pour un usage avancé
export { axiosInstance };