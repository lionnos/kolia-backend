import { mockData } from '../data/mockData';

// Simuler les délais réseau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchRestaurants = async (filters = {}) => {
  await delay(500);
  let restaurants = mockData.restaurants;
  
  if (filters.commune && filters.commune !== 'Tous') {
    restaurants = restaurants.filter(r => r.commune === filters.commune);
  }
  
  if (filters.category && filters.category !== 'Tous') {
    restaurants = restaurants.filter(r => r.category === filters.category);
  }
  
  if (filters.search) {
    restaurants = restaurants.filter(r => 
      r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.description.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  
  return restaurants;
};

export const fetchRestaurantById = async (id) => {
  await delay(300);
  return mockData.restaurants.find(r => r.id === parseInt(id));
};

export const fetchUserOrders = async (userId) => {
  await delay(400);
  return mockData.orders.filter(o => o.userId === userId);
};

export const createOrder = async (orderData) => {
  await delay(800);
  const newOrder = {
    id: Date.now(),
    ...orderData,
    status: 'confirmed',
    date: new Date().toISOString().split('T')[0]
  };
  
  // Sauvegarder dans localStorage
  const savedOrders = localStorage.getItem('orders');
  const orders = savedOrders ? JSON.parse(savedOrders) : [];
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  return newOrder;
};

export const authenticateUser = async (email, password) => {
  await delay(600);
  const user = mockData.users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token: `mock-token-${user.id}` };
  }
  throw new Error('Invalid credentials');
};

export const registerUser = async (userData) => {
  await delay(700);
  const newUser = {
    id: Date.now(),
    ...userData,
    role: 'client'
  };
  const { password: _, ...userWithoutPassword } = newUser;
  return { user: userWithoutPassword, token: `mock-token-${newUser.id}` };
};

export const fetchRestaurantOrders = async (restaurantId) => {
  await delay(500);
  const savedOrders = localStorage.getItem('orders');
  const orders = savedOrders ? JSON.parse(savedOrders) : mockData.orders;
  return orders.filter(o => o.restaurantId === parseInt(restaurantId));
};

export const updateOrderStatus = async (orderId, status) => {
  await delay(400);
  
  const savedOrders = localStorage.getItem('orders');
  let orders = savedOrders ? JSON.parse(savedOrders) : mockData.orders;
  
  // Mettre à jour la commande
  orders = orders.map(order => 
    order.id === parseInt(orderId) 
      ? { 
          ...order, 
          status, 
          ...(status === 'delivered' ? { deliveredAt: new Date().toISOString() } : {}),
          ...(status === 'out_for_delivery' ? { acceptedAt: new Date().toISOString() } : {})
        }
      : order
  );
  
  localStorage.setItem('orders', JSON.stringify(orders));
  
  return { id: orderId, status, updatedAt: new Date().toISOString() };
};

export const fetchRestaurantResources = async (restaurantId) => {
  await delay(500);
  
  const savedResources = localStorage.getItem(`restaurant_${restaurantId}_resources`);
  
  if (savedResources) {
    return JSON.parse(savedResources);
  }
  
  return mockData.resources.filter(r => r.restaurantId === parseInt(restaurantId));
};

export const addResource = async (restaurantId, resourceData) => {
  await delay(700);
  
  const savedResources = localStorage.getItem(`restaurant_${restaurantId}_resources`);
  const resources = savedResources ? JSON.parse(savedResources) : [];
  
  const newResource = {
    id: Date.now(),
    restaurantId: parseInt(restaurantId),
    ...resourceData
  };
  
  const updatedResources = [...resources, newResource];
  localStorage.setItem(`restaurant_${restaurantId}_resources`, JSON.stringify(updatedResources));
  
  return newResource;
};

export const updateResource = async (resourceId, resourceData) => {
  await delay(600);
  
  const restaurantId = resourceData.restaurantId || 1;
  
  const savedResources = localStorage.getItem(`restaurant_${restaurantId}_resources`);
  const resources = savedResources ? JSON.parse(savedResources) : [];
  
  const updatedResources = resources.map(resource => 
    resource.id === parseInt(resourceId) 
      ? { ...resource, ...resourceData }
      : resource
  );
  
  localStorage.setItem(`restaurant_${restaurantId}_resources`, JSON.stringify(updatedResources));
  
  return { id: resourceId, ...resourceData };
};

export const deleteResource = async (resourceId) => {
  await delay(500);
  
  const restaurantId = 1;
  
  const savedResources = localStorage.getItem(`restaurant_${restaurantId}_resources`);
  const resources = savedResources ? JSON.parse(savedResources) : [];
  
  const updatedResources = resources.filter(resource => resource.id !== parseInt(resourceId));
  localStorage.setItem(`restaurant_${restaurantId}_resources`, JSON.stringify(updatedResources));
  
  return true;
};

// Fonctions pour la gestion des plats
export const addDish = async (restaurantId, dishData) => {
  await delay(700);
  
  const restaurant = mockData.restaurants.find(r => r.id === parseInt(restaurantId));
  if (!restaurant) throw new Error('Restaurant non trouvé');
  
  const newDish = {
    id: Date.now(),
    ...dishData
  };
  
  restaurant.dishes.push(newDish);
  return newDish;
};

export const updateDish = async (dishId, dishData) => {
  await delay(600);
  
  for (const restaurant of mockData.restaurants) {
    const dishIndex = restaurant.dishes.findIndex(d => d.id === parseInt(dishId));
    if (dishIndex !== -1) {
      restaurant.dishes[dishIndex] = { ...restaurant.dishes[dishIndex], ...dishData };
      return restaurant.dishes[dishIndex];
    }
  }
  
  throw new Error('Plat non trouvé');
};

export const deleteDish = async (dishId) => {
  await delay(500);
  
  for (const restaurant of mockData.restaurants) {
    const dishIndex = restaurant.dishes.findIndex(d => d.id === parseInt(dishId));
    if (dishIndex !== -1) {
      restaurant.dishes.splice(dishIndex, 1);
      return true;
    }
  }
  
  throw new Error('Plat non trouvé');
};

// Fonctions pour la gestion des livreurs
export const fetchDeliveryDrivers = async (filters = {}) => {
  await delay(500);
  let drivers = mockData.deliveryDrivers;
  
  if (filters.area && filters.area !== 'Tous') {
    drivers = drivers.filter(d => d.deliveryAreas.includes(filters.area));
  }
  
  if (filters.available !== undefined) {
    drivers = drivers.filter(d => d.available === filters.available);
  }
  
  return drivers;
};

export const fetchDeliveryDriverById = async (id) => {
  await delay(300);
  return mockData.deliveryDrivers.find(d => d.id === parseInt(id));
};

export const assignDriverToOrder = async (orderId, driverId) => {
  await delay(600);
  
  const savedOrders = localStorage.getItem('orders');
  let orders = savedOrders ? JSON.parse(savedOrders) : mockData.orders;
  
  // Mettre à jour la commande
  orders = orders.map(order => 
    order.id === parseInt(orderId) 
      ? { ...order, driverId: parseInt(driverId), status: 'out_for_delivery' }
      : order
  );
  
  localStorage.setItem('orders', JSON.stringify(orders));
  
  return { 
    success: true, 
    message: "Livreur assigné avec succès",
    orderId,
    driverId
  };
};

// Fonctions pour le tableau de bord des livreurs
export const fetchDriverOrders = async (driverId) => {
  await delay(500);
  
  // Récupérer les commandes depuis localStorage ou mockData
  const savedOrders = localStorage.getItem('orders');
  const orders = savedOrders ? JSON.parse(savedOrders) : mockData.orders;
  
  // Filtrer les commandes assignées au livreur ou disponibles
  return orders.filter(order => 
    order.driverId === parseInt(driverId) || 
    (order.status === 'ready_for_delivery' && !order.driverId)
  );
};

export const fetchDriverStats = async (driverId) => {
  await delay(400);
  
  const savedOrders = localStorage.getItem('orders');
  const orders = savedOrders ? JSON.parse(savedOrders) : mockData.orders;
  
  const today = new Date().toISOString().split('T')[0];
  
  const driverOrders = orders.filter(order => order.driverId === parseInt(driverId));
  
  // Modification importante: retourner les statistiques attendues par le dashboard livreur
  return {
    receivedOrders: orders.filter(o => o.status === 'ready_for_delivery' && !o.driverId).length,
    activeDeliveries: driverOrders.filter(o => o.status === 'out_for_delivery').length,
    completedDeliveries: driverOrders.filter(o => o.status === 'delivered' && o.deliveryDate === today).length
  };
};

export const acceptDelivery = async (orderId, driverId) => {
  await delay(600);
  
  const savedOrders = localStorage.getItem('orders');
  let orders = savedOrders ? JSON.parse(savedOrders) : mockData.orders;
  
  // Mettre à jour la commande
  orders = orders.map(order => 
    order.id === parseInt(orderId) 
      ? { 
          ...order, 
          driverId: parseInt(driverId), 
          status: 'out_for_delivery', 
          acceptedAt: new Date().toISOString() 
        }
      : order
  );
  
  localStorage.setItem('orders', JSON.stringify(orders));
  
  return { success: true, message: "Livraison acceptée avec succès" };
};