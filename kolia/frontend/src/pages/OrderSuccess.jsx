import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ShoppingBag, Clock, MapPin, Phone } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  
  const [orderData, setOrderData] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState('25-35 minutes');

  // ✅ Récupérer les données de la commande depuis la navigation
  useEffect(() => {
    if (location.state?.order) {
      setOrderData(location.state.order);
      
      // ✅ Calculer le temps de livraison estimé basé sur l'heure actuelle
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + 35 * 60000); // +35 minutes
      const formattedTime = deliveryTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      setEstimatedDelivery(`vers ${formattedTime}`);
      
      // ✅ Vider le panier après une commande réussie
      clearCart();
    } else {
      // ✅ Rediriger si pas de données de commande
      navigate('/');
    }
  }, [location.state, clearCart, navigate]);

  // ✅ Générer un numéro de commande réaliste
  const generateOrderNumber = () => {
    if (orderData?.id) {
      return `#KOL-${orderData.id.toString().padStart(6, '0')}`;
    }
    if (orderData?.orderId) {
      return `#KOL-${orderData.orderId.toString().padStart(6, '0')}`;
    }
    return `#KOL-${Date.now().toString().slice(-6)}`;
  };

  // ✅ Calculer le total de la commande
  const getOrderTotal = () => {
    if (orderData?.totalAmount) return orderData.totalAmount;
    if (orderData?.total) return orderData.total;
    if (location.state?.total) return location.state.total;
    return 0;
  };

  if (!orderData && !location.state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="bg-white rounded-lg shadow-xl p-6 md:p-8 text-center max-w-md w-full mx-auto"
      >
        {/* Icône de succès */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="bg-green-500 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </motion.div>
        
        {/* Titre */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Commande confirmée !
        </h1>
        
        {/* Message de confirmation */}
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Votre commande a été confirmée avec succès. {user?.name && `Merci ${user.name} !`}
          Vous recevrez une notification avec les détails de livraison.
        </p>
        
        {/* Carte d'information de commande */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <div className="space-y-3">
            {/* Numéro de commande */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">N° de commande:</span>
              <span className="text-sm font-bold text-green-700">{generateOrderNumber()}</span>
            </div>
            
            {/* Temps de livraison */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">
                <strong>Livraison estimée:</strong> {estimatedDelivery}
              </span>
            </div>
            
            {/* Adresse de livraison */}
            {(orderData?.deliveryAddress || user?.address) && (
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                <span className="text-sm text-gray-700 flex-1">
                  <strong>Adresse:</strong> {orderData?.deliveryAddress || user?.address}
                </span>
              </div>
            )}
            
            {/* Total de la commande */}
            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className="text-lg font-bold text-green-700">
                {getOrderTotal().toFixed(2)} FC
              </span>
            </div>
          </div>
        </div>

        {/* Instructions supplémentaires */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-700 text-left">
            💡 <strong>Conseil:</strong> Gardez votre téléphone à portée de main. 
            Notre livreur vous appellera à l'arrivée.
          </p>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            <span>Mes commandes</span>
          </Link>
          
          <Link
            to="/"
            className="flex-1 bg-white border-2 border-green-600 text-green-600 py-3 px-4 rounded-lg hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
          >
            <Home className="w-4 h-4 md:w-5 md:h-5" />
            <span>Accueil</span>
          </Link>
        </div>
        
        {/* Message informatif */}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-gray-500">
            📞 <strong>Service client:</strong> +243 XXX XXX XXX
          </p>
          <p className="text-xs text-gray-500">
            * Vous pouvez suivre l'état de votre commande dans la section "Mes commandes"
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;