import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice, 
    lastCartUpdate,
    createOrder, // ✅ Nouvelle fonction du CartContext
    orderLoading,
    orderError,
    clearOrderError
  } = useCart();
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showReminder, setShowReminder] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Vérifier si le panier est inactif depuis 15 minutes
  useEffect(() => {
    if (items.length > 0) {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastCartUpdate;
      const fifteenMinutes = 15 * 60 * 1000;
      
      if (timeSinceLastUpdate >= fifteenMinutes) {
        setShowReminder(true);
      }
      
      // Vérifier périodiquement
      const intervalId = setInterval(() => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastCartUpdate;
        
        if (timeSinceLastUpdate >= fifteenMinutes) {
          setShowReminder(true);
        }
      }, 60000); // Vérifier toutes les minutes
      
      return () => clearInterval(intervalId);
    } else {
      setShowReminder(false);
    }
  }, [items, lastCartUpdate]);

  // ✅ Effacer les erreurs au montage
  useEffect(() => {
    clearOrderError();
    return () => clearOrderError();
  }, [clearOrderError]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }

    setIsCreatingOrder(true);
    clearOrderError();

    try {
      // ✅ Utilisation de la fonction createOrder du CartContext (qui utilise Axios)
      const orderData = {
        deliveryAddress: user?.address || '',
        paymentMethod: 'cash', // Par défaut
        customerNotes: ''
      };

      const response = await createOrder(orderData);
      
      // ✅ Redirection vers la page de succès avec les données de la commande
      navigate('/order-success', { 
        state: { 
          order: response,
          orderId: response.id || response.orderId
        }
      });
      
    } catch (error) {
      // ✅ L'erreur est déjà gérée dans CartContext, on peut l'afficher directement
      console.error('Erreur lors de la création de la commande:', error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-6">Découvrez nos restaurants et ajoutez des plats délicieux!</p>
          <Link
            to="/"
            className="bg-primary text-dark px-6 py-3 rounded-lg hover:bg-opacity-80 transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Découvrir les restaurants</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-dark">Mon Panier</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearCart}
              className="text-error hover:bg-error hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vider le panier</span>
            </motion.button>
          </div>

          {/* ✅ Message d'erreur de commande */}
          {orderError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error text-white p-4 rounded-lg mb-6"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium">❌ {orderError}</p>
                <button
                  onClick={clearOrderError}
                  className="text-white hover:text-gray-200 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-dark mb-4">
                  Articles ({items.length})
                </h2>
                
                <div className="space-y-4">
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-dark">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.restaurantName}</p>
                        <p className="text-lg font-bold text-primary">{item.price?.toFixed(2)}FC</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          disabled={isCreatingOrder}
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        
                        <span className="text-lg font-semibold text-dark min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                          disabled={isCreatingOrder}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.id)}
                        className="text-error hover:bg-error hover:text-white p-2 rounded-lg transition-colors"
                        disabled={isCreatingOrder}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-md p-6 sticky top-4"
              >
                <h2 className="text-xl font-semibold text-dark mb-4">Résumé de la commande</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total ({items.length} article(s))</span>
                    <span className="font-semibold">{getTotalPrice().toFixed(2)}FC</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="font-semibold">3000FC</span>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{(getTotalPrice() + 3000).toFixed(2)}FC</span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={!isCreatingOrder ? { scale: 1.02 } : {}}
                  whileTap={!isCreatingOrder ? { scale: 0.98 } : {}}
                  onClick={handleCheckout}
                  disabled={isCreatingOrder || orderLoading}
                  className={`w-full py-4 rounded-lg font-semibold transition-colors mt-6 flex items-center justify-center ${
                    isCreatingOrder || orderLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary text-dark hover:bg-opacity-80'
                  }`}
                >
                  {isCreatingOrder || orderLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                      Création de la commande...
                    </div>
                  ) : (
                    'Passer la commande'
                  )}
                </motion.button>
                
                <Link
                  to="/"
                  className="block text-center text-gray-600 hover:text-primary transition-colors mt-4"
                >
                  Continuer mes achats
                </Link>

                {/* Notification de rappel après 15 minutes */}
                {showReminder && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-warning bg-opacity-20 border border-warning rounded-lg"
                  >
                    <p className="text-warning font-medium">
                      ⏰ Vous avez des articles dans votre panier depuis plus de 15 minutes.
                      N'oubliez pas de finaliser votre commande!
                    </p>
                  </motion.div>
                )}

                {/* ✅ Informations de livraison */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🚚 Livraison estimée: 30-45 minutes
                  </p>
                  {user?.address && (
                    <p className="text-xs text-blue-600 mt-1">
                      Adresse: {user.address}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;