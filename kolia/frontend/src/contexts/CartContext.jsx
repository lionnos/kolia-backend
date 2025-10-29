import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderAPI } from '../api/api'; // ✅ Import d'Axios pour les commandes
import { useAuth } from './AuthContext'; // ✅ Pour avoir l'utilisateur connecté

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [lastCartUpdate, setLastCartUpdate] = useState(Date.now());
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  
  const { user, isAuthenticated } = useAuth(); // ✅ Utilisateur connecté

  useEffect(() => {
    const savedCart = localStorage.getItem('bukavu-cart');
    if (savedCart) {
      const { items: savedItems, restaurantId: savedRestaurantId, lastUpdate } = JSON.parse(savedCart);
      setItems(savedItems || []);
      setRestaurantId(savedRestaurantId);
      setLastCartUpdate(lastUpdate || Date.now());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bukavu-cart', JSON.stringify({ 
      items, 
      restaurantId, 
      lastUpdate: lastCartUpdate 
    }));
  }, [items, restaurantId, lastCartUpdate]);

  const addItem = (dish, restaurant) => {
    // Vérifier si le plat a des options et si une option est sélectionnée
    const dishId = dish.selectedOption 
      ? `${dish.id}-${dish.selectedOption.id}` 
      : dish.id.toString();

    if (restaurantId && restaurantId !== restaurant.id) {
      const confirm = window.confirm(
        `Vous avez déjà des articles de ${items[0]?.restaurantName}. Voulez-vous vider le panier pour ajouter des articles de ${restaurant.name}?`
      );
      if (confirm) {
        setItems([{ 
          ...dish, 
          id: dishId,
          quantity: 1, 
          restaurantName: restaurant.name,
          originalName: dish.originalName || dish.name // Conserver le nom original
        }]);
        setRestaurantId(restaurant.id);
        setLastCartUpdate(Date.now());
      }
      return;
    }

    const existingItem = items.find(item => item.id === dishId);
    if (existingItem) {
      setItems(items.map(item =>
        item.id === dishId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { 
        ...dish, 
        id: dishId,
        quantity: 1, 
        restaurantName: restaurant.name,
        originalName: dish.originalName || dish.name // Conserver le nom original
      }]);
      setRestaurantId(restaurant.id);
    }
    setLastCartUpdate(Date.now());
  };

  const removeItem = (dishId) => {
    const newItems = items.filter(item => item.id !== dishId);
    setItems(newItems);
    if (newItems.length === 0) {
      setRestaurantId(null);
    }
    setLastCartUpdate(Date.now());
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }

    setItems(items.map(item =>
      item.id === dishId
        ? { ...item, quantity }
        : item
    ));
    setLastCartUpdate(Date.now());
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setLastCartUpdate(Date.now());
    setOrderError(null); // ✅ Effacer les erreurs précédentes
  };

  // ✅ FONCTION NOUVELLE : Créer une commande via l'API Axios
  const createOrder = async (orderData = {}) => {
    if (!isAuthenticated) {
      throw new Error('Vous devez être connecté pour passer une commande');
    }

    if (items.length === 0) {
      throw new Error('Le panier est vide');
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      // Préparer les données de la commande
      const orderPayload = {
        restaurantId: restaurantId,
        items: items.map(item => ({
          dishId: item.originalId || item.id, // ID original du plat
          dishName: item.originalName || item.name, // Nom original du plat
          quantity: item.quantity,
          price: item.price,
          options: item.selectedOption ? [item.selectedOption] : [],
          specialInstructions: item.specialInstructions || ''
        })),
        totalAmount: getTotalPrice(),
        deliveryAddress: orderData.deliveryAddress || user.address || '',
        customerNotes: orderData.customerNotes || '',
        paymentMethod: orderData.paymentMethod || 'cash', // cash, card, mobile_money
        ...orderData
      };

      // ✅ Appel API avec Axios
      const response = await orderAPI.create(orderPayload);
      
      // ✅ Vider le panier après commande réussie
      clearCart();
      
      setOrderLoading(false);
      return response.data; // ✅ Retourner les données de la commande

    } catch (error) {
      setOrderLoading(false);
      
      // ✅ Gestion d'erreur améliorée avec Axios
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors de la création de la commande';
      
      setOrderError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // ✅ FONCTION NOUVELLE : Effacer les erreurs de commande
  const clearOrderError = () => {
    setOrderError(null);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ FONCTION NOUVELLE : Obtenir le résumé du panier pour l'affichage
  const getCartSummary = () => {
    return {
      totalItems: getTotalItems(),
      totalPrice: getTotalPrice(),
      restaurantName: items[0]?.restaurantName || '',
      itemCount: items.length
    };
  };

  const value = {
    items,
    restaurantId,
    lastCartUpdate,
    orderLoading,
    orderError,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    createOrder, // ✅ Nouvelle fonction
    clearOrderError, // ✅ Nouvelle fonction
    getTotalPrice,
    getTotalItems,
    getCartSummary, // ✅ Nouvelle fonction
    canCheckout: isAuthenticated && items.length > 0 && restaurantId !== null
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};