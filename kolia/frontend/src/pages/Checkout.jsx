import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { CreditCard, MapPin, Clock, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // ✅ Changé à 'cash' par défaut
  
  const { 
    items, 
    getTotalPrice, 
    clearCart, 
    restaurantId,
    createOrder, // ✅ Utilisation de la fonction du CartContext
    orderError,
    clearOrderError
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      address: user?.address || '',
      phone: user?.phone || '',
      customerNotes: ''
    }
  });

  // ✅ Effacer les erreurs au montage
  useEffect(() => {
    clearOrderError();
    return () => clearOrderError();
  }, [clearOrderError]);

  // ✅ Pré-remplir l'adresse si disponible
  useEffect(() => {
    if (user?.address) {
      setValue('address', user.address);
    }
    if (user?.phone) {
      setValue('phone', user.phone);
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    setIsLoading(true);
    clearOrderError();
    
    try {
      const orderData = {
        deliveryAddress: data.address,
        phone: data.phone,
        paymentMethod: paymentMethod,
        customerNotes: data.customerNotes || '',
        // ✅ Les autres données (items, restaurantId, etc.) sont gérées dans CartContext
      };

      // ✅ Utilisation de createOrder du CartContext (qui utilise Axios)
      const response = await createOrder(orderData);
      
      // ✅ Redirection vers la page de succès avec les données de la commande
      navigate('/order-success', { 
        state: { 
          order: response,
          orderId: response.id || response.orderId,
          total: getTotalPrice() + 3000
        }
      });
      
    } catch (error) {
      // ✅ L'erreur est déjà gérée dans CartContext, on peut l'afficher directement
      console.error('Error creating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Redirection si panier vide
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-dark text-center mb-8">Finaliser la commande</h1>

          {/* ✅ Message d'erreur */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-dark mb-6">Informations de livraison</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Adresse de livraison</span>
                  </label>
                  <textarea
                    {...register('address', { 
                      required: 'L\'adresse est requise',
                      minLength: {
                        value: 10,
                        message: 'L\'adresse doit contenir au moins 10 caractères'
                      }
                    })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors disabled:opacity-50"
                    placeholder="Votre adresse complète (quartier, avenue, numéro)..."
                    disabled={isLoading}
                  />
                  {errors.address && (
                    <p className="text-error text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Téléphone</span>
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { 
                      required: 'Le téléphone est requis',
                      pattern: {
                        value: /^(\+243|243)?\s?[0-9]{9}$/,
                        message: 'Format: +243 970123456 ou 243970123456'
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors disabled:opacity-50"
                    placeholder="+243 970123456"
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="text-error text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes pour le restaurant (optionnel)
                  </label>
                  <textarea
                    {...register('customerNotes')}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors disabled:opacity-50"
                    placeholder="Instructions spéciales, allergies, etc."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-4">
                    <CreditCard className="w-4 h-4" />
                    <span>Mode de paiement</span>
                  </label>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'card' 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-gray-300 hover:bg-gray-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="radio"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => !isLoading && setPaymentMethod(e.target.value)}
                        className="mr-3"
                        disabled={isLoading}
                      />
                      <span>Carte bancaire (simulé)</span>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'mobile_money' 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-gray-300 hover:bg-gray-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="radio"
                        value="mobile_money"
                        checked={paymentMethod === 'mobile_money'}
                        onChange={(e) => !isLoading && setPaymentMethod(e.target.value)}
                        className="mr-3"
                        disabled={isLoading}
                      />
                      <span>Mobile Money</span>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cash' 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-gray-300 hover:bg-gray-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => !isLoading && setPaymentMethod(e.target.value)}
                        className="mr-3"
                        disabled={isLoading}
                      />
                      <span>Paiement à la livraison</span>
                    </label>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary text-dark hover:bg-opacity-80'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                      Traitement...
                    </div>
                  ) : (
                    'Confirmer la commande'
                  )}
                </motion.button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-xl font-semibold text-dark mb-6">Résumé de la commande</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-dark">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.price?.toFixed(2)}FC x {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {((item.price || 0) * item.quantity).toFixed(2)}FC
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total ({items.length} article(s))</span>
                  <span className="font-semibold">{getTotalPrice().toFixed(2)}FC</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="font-semibold">3000 FC</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-primary">{(getTotalPrice() + 3000).toFixed(2)}FC</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Livraison estimée: 25-35 minutes</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Restaurant: {items[0]?.restaurantName}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;