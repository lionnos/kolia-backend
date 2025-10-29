import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Package, Plus, Edit, Trash2, Eye, AlertTriangle, Clock, X, Box, Camera, RefreshCw } from 'lucide-react';
import { restaurantAPI, orderAPI, dishAPI } from '../api/api'; // ✅ Changé vers l'API Axios
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [remainingTimes, setRemainingTimes] = useState({});
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // État pour le formulaire d'ajout/modification de plat
  const [dishForm, setDishForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparationTime: 25,
    image: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    hasOptions: false,
    options: []
  });

  useEffect(() => {
    loadData();
  }, []);

  // Gestion du compte à rebours
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTimes(prev => {
        const newTimes = { ...prev };
        Object.keys(newTimes).forEach(orderId => {
          if (newTimes[orderId] > 0) {
            newTimes[orderId] -= 1;
          }
        });
        return newTimes;
      });
    }, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (user?.restaurantId) {
        // ✅ Utilisation d'Axios pour charger les données
        const [ordersResponse, restaurantResponse, dishesResponse] = await Promise.all([
          orderAPI.getRestaurantOrders(),
          restaurantAPI.getByOwner(),
          dishAPI.getByRestaurant(user.restaurantId)
        ]);

        // ✅ Extraction des données depuis les réponses Axios
        const ordersData = ordersResponse.data.orders || ordersResponse.data || [];
        const restaurantData = restaurantResponse.data.restaurant || restaurantResponse.data;
        const dishesData = dishesResponse.data.dishes || dishesResponse.data || [];

        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setRestaurant(restaurantData);
        setDishes(Array.isArray(dishesData) ? dishesData : []);
        
        // Initialiser les temps restants
        const initialRemainingTimes = {};
        ordersData.forEach(order => {
          if (order.status === 'preparing' || order.status === 'en_preparation') {
            if (order.estimatedTime) {
              initialRemainingTimes[order.id] = order.estimatedTime;
            } else {
              // Calculer le temps maximum de préparation parmi les plats de la commande
              const maxPreparationTime = Math.max(
                ...(order.items || []).map(item => item.preparationTime || 25)
              );
              initialRemainingTimes[order.id] = maxPreparationTime;
            }
          }
        });
        setRemainingTimes(initialRemainingTimes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      
      // ✅ Gestion d'erreur améliorée avec Axios
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors du chargement des données';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // ✅ Utilisation d'Axios pour mettre à jour le statut
      await orderAPI.updateStatus(orderId, newStatus);
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Réinitialiser le compte à rebours si la commande est livrée
      if (newStatus === 'delivered' || newStatus === 'livree') {
        setRemainingTimes(prev => {
          const newTimes = { ...prev };
          delete newTimes[orderId];
          return newTimes;
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // ✅ Gestion d'erreur
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors de la mise à jour du statut';
      
      alert(errorMessage);
    }
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    try {
      const dishData = {
        ...dishForm,
        price: parseFloat(dishForm.price),
        preparationTime: parseInt(dishForm.preparationTime),
        restaurantId: user.restaurantId
      };

      if (editingDish) {
        // ✅ Utilisation d'Axios pour modifier un plat
        await dishAPI.update(editingDish.id, dishData);
      } else {
        // ✅ Utilisation d'Axios pour ajouter un plat
        await dishAPI.create(dishData);
      }
      
      setShowAddDishModal(false);
      setEditingDish(null);
      setDishForm({
        name: '',
        description: '',
        price: '',
        category: '',
        preparationTime: 25,
        image: '',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        hasOptions: false,
        options: []
      });
      
      // Recharger les données
      await loadData();
    } catch (error) {
      console.error('Error saving dish:', error);
      
      // ✅ Gestion d'erreur
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors de la sauvegarde du plat';
      
      alert(errorMessage);
    }
  };

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      category: dish.category,
      preparationTime: dish.preparationTime || 25,
      image: dish.image || '',
      isVegetarian: dish.isVegetarian || false,
      isVegan: dish.isVegan || false,
      isGlutenFree: dish.isGlutenFree || false,
      isSpicy: dish.isSpicy || false,
      hasOptions: dish.hasOptions || false,
      options: dish.options || []
    });
    setShowAddDishModal(true);
  };

  const handleDeleteDish = async (dishId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      try {
        // ✅ Utilisation d'Axios pour supprimer un plat
        await dishAPI.delete(dishId);
        await loadData();
      } catch (error) {
        console.error('Error deleting dish:', error);
        
        // ✅ Gestion d'erreur
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || 'Erreur lors de la suppression du plat';
        
        alert(errorMessage);
      }
    }
  };

  const handleDishImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setDishForm({ ...dishForm, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // ✅ Calcul des statistiques avec gestion sécurisée
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => 
      o.status === 'preparing' || o.status === 'en_preparation' || o.status === 'confirmed'
    ).length,
    completedOrders: orders.filter(o => 
      o.status === 'delivered' || o.status === 'livree'
    ).length,
    criticalOrders: Object.keys(remainingTimes).filter(
      orderId => remainingTimes[orderId] <= 5 && remainingTimes[orderId] > 0
    ).length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0),
    totalDishes: dishes.length
  };

  // ✅ Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Confirmée';
      case 'preparing':
      case 'en_preparation':
        return 'En préparation';
      case 'delivered':
      case 'livree':
        return 'Livrée';
      case 'cancelled':
      case 'annulee':
        return 'Annulée';
      case 'pending':
      case 'en_attente':
        return 'En attente';
      default:
        return status || 'Inconnu';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* En-tête avec bouton de rafraîchissement */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-dark">
                Tableau de bord - {restaurant?.name || 'Mon Restaurant'}
              </h1>
              <p className="text-gray-600 mt-2">Gérez votre restaurant</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-primary text-dark px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Rafraîchir</span>
            </motion.button>
          </div>

          {/* Message d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error text-white p-4 rounded-lg mb-6"
            >
              <p className="font-medium">❌ {error}</p>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {/* ... (le code des cartes de statistiques reste identique) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Commandes</p>
                  <p className="text-2xl font-bold text-dark">{stats.totalOrders}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">En préparation</p>
                  <p className="text-2xl font-bold text-warning">{stats.pendingOrders}</p>
                </div>
                <Package className="w-8 h-8 text-warning" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Complétées</p>
                  <p className="text-2xl font-bold text-success">{stats.completedOrders}</p>
                </div>
                <Package className="w-8 h-8 text-success" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Commandes Critiques</p>
                  <p className="text-2xl font-bold text-error">{stats.criticalOrders}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenus Total</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalRevenue.toFixed(2)}FC</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Plats au menu</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalDishes}</p>
                </div>
                <Box className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Commandes
                </button>
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'menu'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Menu
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">Gestion des commandes</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucune commande pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => {
                        const remainingTime = remainingTimes[order.id] || 0;
                        const isCritical = remainingTime <= 5 && 
                          (order.status === 'preparing' || order.status === 'en_preparation');
                        
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`border border-gray-200 rounded-lg p-4 ${
                              isCritical ? 'bg-error bg-opacity-10 border-error' : ''
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-dark">Commande #{order.id}</h3>
                                <p className="text-gray-600 text-sm">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : 'Date non disponible'}
                                </p>
                                <p className="text-gray-600 text-sm">{order.deliveryAddress || 'Adresse non spécifiée'}</p>
                                
                                {/* Affichage du compte à rebours */}
                                {(order.status === 'preparing' || order.status === 'en_preparation') && (
                                  <div className={`flex items-center mt-2 ${
                                    isCritical ? 'text-error font-semibold' : 'text-warning'
                                  }`}>
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>Temps restant: {remainingTime} min</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                >
                                  <option value="confirmed">Confirmée</option>
                                  <option value="preparing">En préparation</option>
                                  <option value="delivered">Livrée</option>
                                </select>
                                
                                <span className="text-xl font-bold text-primary">
                                  {(order.totalAmount || order.total || 0).toFixed(2)}FC
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-dark mb-2">Articles:</h4>
                              <div className="space-y-1">
                                {(order.items || []).map((item, index) => (
                                  <div key={item.id || index} className="flex justify-between text-sm">
                                    <span>{item.dishName || item.name} x{item.quantity || 1}</span>
                                    <span>{((item.price || 0) * (item.quantity || 1)).toFixed(2)}FC</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'menu' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-dark">Gestion du menu</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddDishModal(true)}
                      className="bg-primary text-dark px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un plat</span>
                    </motion.button>
                  </div>
                  
                  {dishes.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun plat dans votre menu</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dishes.map(dish => (
                        <motion.div
                          key={dish.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          {dish.image && (
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          
                          <h3 className="font-semibold text-dark mb-2">{dish.name}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {dish.description}
                          </p>
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-lg font-bold text-primary">
                              {(dish.price || 0).toFixed(2)}FC
                            </p>
                            <p className="text-sm text-gray-600">
                              Préparation: {dish.preparationTime || 25} min
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-secondary text-dark px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors flex items-center justify-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>Voir</span>
                            </button>
                            
                            <button 
                              onClick={() => handleEditDish(dish)}
                              className="flex-1 bg-warning text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Modifier</span>
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteDish(dish.id)}
                              className="flex-1 bg-error text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal d'ajout/modification de plat */}
      {showAddDishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-dark">
                  {editingDish ? 'Modifier le plat' : 'Ajouter un plat'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddDishModal(false);
                    setEditingDish(null);
                    setDishForm({
                      name: '',
                      description: '',
                      price: '',
                      category: '',
                      preparationTime: 25,
                      image: '',
                      isVegetarian: false,
                      isVegan: false,
                      isGlutenFree: false,
                      isSpicy: false,
                      hasOptions: false,
                      options: []
                    });
                  }}
                  className="text-gray-500 hover:text-error"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleDishSubmit} className="space-y-4">
                {/* ... (le formulaire reste identique) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du plat *
                  </label>
                  <input
                    type="text"
                    value={dishForm.name}
                    onChange={(e) => setDishForm({...dishForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={dishForm.description}
                    onChange={(e) => setDishForm({...dishForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (FC) *
                  </label>
                  <input
                    type="number"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({...dishForm, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <input
                    type="text"
                    value={dishForm.category}
                    onChange={(e) => setDishForm({...dishForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temps de préparation (minutes) *
                  </label>
                  <input
                    type="number"
                    value={dishForm.preparationTime}
                    onChange={(e) => setDishForm({...dishForm, preparationTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image du plat
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 text-gray-500 mb-2" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="camera"
                        onChange={handleDishImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {dishForm.image && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Aperçu de l'image :</p>
                      <img 
                        src={dishForm.image} 
                        alt="Aperçu" 
                        className="w-32 h-32 object-cover rounded-lg mt-2"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={dishForm.isVegetarian}
                      onChange={(e) => setDishForm({...dishForm, isVegetarian: e.target.checked})}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Végétarien</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={dishForm.isVegan}
                      onChange={(e) => setDishForm({...dishForm, isVegan: e.target.checked})}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Végan</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={dishForm.isGlutenFree}
                      onChange={(e) => setDishForm({...dishForm, isGlutenFree: e.target.checked})}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Sans gluten</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={dishForm.isSpicy}
                      onChange={(e) => setDishForm({...dishForm, isSpicy: e.target.checked})}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Épicé</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDishModal(false);
                      setEditingDish(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-opacity-80 transition-colors"
                  >
                    {editingDish ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;