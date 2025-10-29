// Tous les endpoints de l'API centralisés
const BASE_URL = '/api';

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    PROFILE: `${BASE_URL}/auth/profile`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  },
  
  // Users
  USERS: {
    BASE: `${BASE_URL}/users`,
    PROFILE: `${BASE_URL}/users/profile`,
    BY_ID: (id) => `${BASE_URL}/users/${id}`,
    UPDATE_PROFILE: `${BASE_URL}/users/profile`,
    UPDATE_PASSWORD: `${BASE_URL}/users/password`,
  },
  
  // Restaurants
  RESTAURANTS: {
    BASE: `${BASE_URL}/restaurants`,
    BY_ID: (id) => `${BASE_URL}/restaurants/${id}`,
    BY_OWNER: `${BASE_URL}/restaurants/owner`,
    SEARCH: `${BASE_URL}/restaurants/search`,
    NEARBY: `${BASE_URL}/restaurants/nearby`,
  },
  
  // Dishes
  DISHES: {
    BASE: `${BASE_URL}/dishes`,
    BY_ID: (id) => `${BASE_URL}/dishes/${id}`,
    BY_RESTAURANT: (restaurantId) => `${BASE_URL}/dishes/restaurant/${restaurantId}`,
    SEARCH: `${BASE_URL}/dishes/search`,
    CATEGORIES: `${BASE_URL}/dishes/categories`,
  },
  
  // Orders
  ORDERS: {
    BASE: `${BASE_URL}/orders`,
    BY_ID: (id) => `${BASE_URL}/orders/${id}`,
    USER: `${BASE_URL}/orders/user`,
    RESTAURANT: `${BASE_URL}/orders/restaurant`,
    DRIVER: `${BASE_URL}/orders/driver`,
    UPDATE_STATUS: (id) => `${BASE_URL}/orders/${id}/status`,
    TRACK: (id) => `${BASE_URL}/orders/${id}/track`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: `${BASE_URL}/payments`,
    PROCESS: `${BASE_URL}/payments/process`,
    VERIFY: (id) => `${BASE_URL}/payments/${id}/verify`,
    HISTORY: `${BASE_URL}/payments/history`,
  },
  
  // Upload
  UPLOAD: {
    BASE: `${BASE_URL}/upload`,
    AVATAR: `${BASE_URL}/upload/avatar`,
    DISH_IMAGE: `${BASE_URL}/upload/dish`,
    RESTAURANT_IMAGE: `${BASE_URL}/upload/restaurant`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: `${BASE_URL}/notifications`,
    BY_USER: `${BASE_URL}/notifications/user`,
    MARK_READ: (id) => `${BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE_URL}/notifications/read-all`,
  },

  // Drivers
  DRIVERS: {
    BASE: `${BASE_URL}/drivers`,
    PROFILE: `${BASE_URL}/drivers/profile`,
    AVAILABLE_ORDERS: `${BASE_URL}/drivers/available-orders`,
    ACCEPT_ORDER: (id) => `${BASE_URL}/drivers/orders/${id}/accept`,
  },
};

// Méthodes HTTP communes
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

export default ENDPOINTS;