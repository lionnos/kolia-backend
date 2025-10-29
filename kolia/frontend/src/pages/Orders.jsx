import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { orderAPI } from '../api/api'; // ✅ Changé vers l'API Axios
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ Utilisation d'Axios via orderAPI
      const response = await orderAPI.getUserOrders();
      
      // ✅ Axios retourne les données dans response.data
      const ordersData = response.data.orders || response.data;
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
    } catch (error) {
      console.error('Error loading orders:', error);
      
      // ✅ Gestion d'erreur améliorée avec Axios
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors du chargement des commandes';
      
      setError(errorMessage);
      setOrders([]); // ✅ S'assurer que orders est un tableau vide en cas d'erreur
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'preparing':
      case 'en_preparation':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'delivered':
      case 'livree':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'cancelled':
      case 'annulee':
        return <XCircle className="w-5 h-5 text-error" />;
      case 'pending':
      case 'en_attente':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'on_the_way':
      case 'en_route':
        return <Package className="w-5 h-5 text-orange-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

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
      case 'on_the_way':
      case 'en_route':
        return 'En route';
      default:
        return 'Statut inconnu';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'preparing':
      case 'en_preparation':
        return 'bg-warning bg-opacity-20 text-warning';
      case 'delivered':
      case 'livree':
        return 'bg-success bg-opacity-20 text-success';
      case 'cancelled':
      case 'annulee':
        return 'bg-error bg-opacity-20 text-error';
      case 'pending':
      case 'en_attente':
        return 'bg-blue-100 text-blue-600';
      case 'on_the_way':
      case 'en_route':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  // ✅ Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString; // Retourner la chaîne originale si le parsing échoue
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-dark">Mes Commandes</h1>
            
            {/* ✅ Bouton de rafraîchissement */}
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

          {/* ✅ Message d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error text-white p-4 rounded-lg mb-6"
            >
              <p className="font-medium">❌ {error}</p>
            </motion.div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-dark mb-4">
                {error ? 'Erreur de chargement' : 'Aucune commande'}
              </h2>
              <p className="text-gray-600 mb-6">
                {error 
                  ? 'Impossible de charger vos commandes. Veuillez réessayer.'
                  : 'Vous n\'avez pas encore passé de commande.'
                }
              </p>
              {error && (
                <button
                  onClick={loadOrders}
                  className="bg-primary text-dark px-6 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Réessayer
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <motion.div
                  key={order.id || order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-dark mb-2">
                        Commande #{order.id || order.orderId}
                      </h3>
                      <p className="text-gray-600 font-medium">
                        {order.restaurantName || order.restaurant?.name || 'Restaurant non spécifié'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt || order.date || order.orderDate)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {(order.totalAmount || order.total || 0).toFixed(2)}FC
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items?.length || 0} article(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Articles de la commande */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-dark mb-3">Articles commandés:</h4>
                    <div className="space-y-2">
                      {(order.items || []).map((item, index) => (
                        <div key={item.id || index} className="flex justify-between items-center">
                          <div className="flex-1">
                            <span className="font-medium">{item.dishName || item.name}</span>
                            <span className="text-gray-600 ml-2">x{item.quantity || 1}</span>
                            {item.specialInstructions && (
                              <p className="text-xs text-gray-500 mt-1">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold whitespace-nowrap">
                            {((item.price || 0) * (item.quantity || 1)).toFixed(2)}FC
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Informations de livraison */}
                  {(order.deliveryAddress || order.address) && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Adresse de livraison:</strong> {order.deliveryAddress || order.address}
                      </p>
                    </div>
                  )}

                  {/* ✅ Informations de paiement */}
                  {order.paymentMethod && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Paiement:</strong> {order.paymentMethod === 'cash' ? 'À la livraison' : 
                                                  order.paymentMethod === 'mobile_money' ? 'Mobile Money' : 
                                                  order.paymentMethod === 'card' ? 'Carte bancaire' : 
                                                  order.paymentMethod}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Orders;