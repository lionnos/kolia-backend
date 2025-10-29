import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Clock, MapPin, Phone, User, Navigation, DollarSign, RefreshCw } from 'lucide-react';
import { orderAPI, driverAPI } from '../api/api'; // ✅ Changé vers l'API Axios
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const DeliveryDriverDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    receivedOrders: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
    
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ Utilisation d'Axios pour charger les données
      const [ordersResponse, statsResponse] = await Promise.all([
        orderAPI.getDriverOrders(),
        driverAPI.getProfile()
      ]);

      // ✅ Extraction des données depuis les réponses Axios
      const ordersData = ordersResponse.data.orders || ordersResponse.data || [];
      const statsData = statsResponse.data.stats || statsResponse.data || {};

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setStats({
        receivedOrders: statsData.receivedOrders || statsData.totalOrders || 0,
        activeDeliveries: statsData.activeDeliveries || 0,
        completedDeliveries: statsData.completedDeliveries || 0,
        totalEarnings: statsData.totalEarnings || statsData.earnings || 0
      });
      
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

  const handleAcceptDelivery = async (orderId) => {
    try {
      // ✅ Utilisation d'Axios pour accepter une livraison
      await driverAPI.acceptOrder(orderId);
      await loadData(); // Recharger les données
    } catch (error) {
      console.error('Error accepting delivery:', error);
      
      // ✅ Gestion d'erreur
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors de l\'acceptation de la livraison';
      
      alert(errorMessage);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // ✅ Utilisation d'Axios pour mettre à jour le statut
      await orderAPI.updateStatus(orderId, newStatus);
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Recharger les statistiques
      await loadData();
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

  const openNavigation = (address) => {
    // Ouvrir l'adresse dans Google Maps ou l'application de navigation par défaut
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
  };

  // ✅ Fonction pour filtrer les commandes par statut
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'available':
        return orders.filter(o => 
          o.status === 'ready_for_delivery' || 
          o.status === 'ready' || 
          o.status === 'available'
        );
      case 'active':
        return orders.filter(o => 
          o.status === 'out_for_delivery' || 
          o.status === 'on_the_way' || 
          o.status === 'active'
        );
      case 'completed':
        return orders.filter(o => 
          o.status === 'delivered' || 
          o.status === 'completed' || 
          o.status === 'livree'
        );
      default:
        return [];
    }
  };

  // ✅ Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'ready_for_delivery':
      case 'ready':
      case 'available':
        return 'Disponible';
      case 'out_for_delivery':
      case 'on_the_way':
      case 'active':
        return 'En cours';
      case 'delivered':
      case 'completed':
      case 'livree':
        return 'Livrée';
      default:
        return status || 'Inconnu';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredOrders = getFilteredOrders();

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
                Tableau de bord Livreur
              </h1>
              <p className="text-gray-600 mt-2">Bon retour, {user?.name || 'Livreur'}!</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Commandes Reçues</p>
                  <p className="text-2xl font-bold text-primary">{stats.receivedOrders}</p>
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
                  <p className="text-gray-600 text-sm">En Cours de Livraison</p>
                  <p className="text-2xl font-bold text-warning">{stats.activeDeliveries}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
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
                  <p className="text-gray-600 text-sm">Commandes Livrées</p>
                  <p className="text-2xl font-bold text-success">{stats.completedDeliveries}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
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
                  <p className="text-gray-600 text-sm">Gains Totaux</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalEarnings.toFixed(2)}FC</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('available')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'available'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Disponibles ({orders.filter(o => 
                    o.status === 'ready_for_delivery' || 
                    o.status === 'ready' || 
                    o.status === 'available'
                  ).length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  En Cours ({orders.filter(o => 
                    o.status === 'out_for_delivery' || 
                    o.status === 'on_the_way' || 
                    o.status === 'active'
                  ).length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'completed'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Terminées ({orders.filter(o => 
                    o.status === 'delivered' || 
                    o.status === 'completed' || 
                    o.status === 'livree'
                  ).length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  {activeTab === 'available' && <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                  {activeTab === 'active' && <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                  {activeTab === 'completed' && <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                  <p className="text-gray-600">
                    {activeTab === 'available' && 'Aucune livraison disponible pour le moment'}
                    {activeTab === 'active' && 'Aucune livraison en cours'}
                    {activeTab === 'completed' && 'Aucune livraison effectuée aujourd\'hui'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map(order => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border border-gray-200 rounded-lg p-4 ${
                        activeTab === 'completed' ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-dark">Commande #{order.id || order.orderId}</h3>
                          <p className="text-gray-600 text-sm">{order.restaurantName || order.restaurant?.name}</p>
                          
                          <div className="flex items-center mt-2 text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{order.deliveryAddress || order.address || 'Adresse non spécifiée'}</span>
                          </div>
                          
                          <div className="flex items-center mt-1 text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            <span className="text-sm">{order.customerName || order.customer?.name || 'Client'}</span>
                            <Phone className="w-4 h-4 ml-2 mr-1" />
                            <span className="text-sm">{order.customerPhone || order.customer?.phone || 'Téléphone non disponible'}</span>
                          </div>

                          <div className="flex items-center mt-1 text-primary">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="text-sm font-semibold">
                              Frais de livraison: {(order.deliveryFee || order.deliveryAmount || 0).toFixed(2)}FC
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                          <span className="text-xl font-bold text-primary">
                            {(order.totalAmount || order.total || 0).toFixed(2)}FC
                          </span>
                          {activeTab === 'completed' && (
                            <div className="bg-success text-white px-2 py-1 rounded-full text-sm">
                              Livrée
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-dark mb-2">Articles:</h4>
                          <div className="space-y-1">
                            {(order.items || []).map((item, index) => (
                              <div key={item.id || index} className="text-sm">
                                <span>{item.dishName || item.name} x{item.quantity || 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-2">
                          {activeTab === 'available' && (
                            <button
                              onClick={() => handleAcceptDelivery(order.id || order.orderId)}
                              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Package className="w-4 h-4" />
                              <span>Accepter</span>
                            </button>
                          )}
                          
                          {activeTab === 'active' && (
                            <>
                              <button
                                onClick={() => openNavigation(order.deliveryAddress || order.address)}
                                className="bg-secondary text-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                              >
                                <Navigation className="w-4 h-4" />
                                <span>Navigation</span>
                              </button>
                              
                              <button
                                onClick={() => handleStatusUpdate(order.id || order.orderId, 'delivered')}
                                className="bg-success text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Marquer comme livrée</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeliveryDriverDashboard;