import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Eye, Star, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import OptionModal from './OptionModal';

const DishCard = ({ dish, restaurant, onView }) => {
  const { addItem, items, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Générer un identifiant unique pour le plat avec option
  const getDishId = () => {
    if (selectedOption) {
      return `${dish.id}-${selectedOption.id}`;
    }
    return dish.id.toString();
  };

  const cartItem = items.find(item => item.id === getDishId());
  const quantity = cartItem?.quantity || 0;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      // ✅ Redirection vers login si non authentifié
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (dish.hasOptions) {
      setShowOptionModal(true);
    } else {
      setIsAddingToCart(true);
      try {
        await addItem(dish, restaurant);
      } catch (error) {
        console.error('Error adding item to cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const handleSelectOption = async (option) => {
    setSelectedOption(option);
    setShowOptionModal(false);
    
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsAddingToCart(true);
    try {
      // ✅ Créer une copie du plat avec l'option sélectionnée
      const dishWithOption = {
        ...dish,
        id: `${dish.id}-${option.id}`, // ID unique pour le panier
        baseId: dish.id, // Conserver l'ID de base pour référence
        name: `${dish.name} (${option.name})`,
        price: option.price,
        selectedOption: option,
        originalName: dish.name // ✅ Conserver le nom original
      };
      
      await addItem(dishWithOption, restaurant);
    } catch (error) {
      console.error('Error adding item with option to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleIncrease = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    updateQuantity(getDishId(), quantity + 1);
  };

  const handleDecrease = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    updateQuantity(getDishId(), quantity - 1);
  };

  const handleView = () => {
    if (onView) {
      onView(dish);
    }
  };

  // ✅ Fonction pour afficher les badges diététiques
  const renderDietaryBadges = () => {
    const badges = [];
    if (dish.isVegetarian) badges.push('🥬 Végétarien');
    if (dish.isVegan) badges.push('🌱 Végan');
    if (dish.isGlutenFree) badges.push('🌾 Sans gluten');
    if (dish.isSpicy) badges.push('🌶️ Épicé');

    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mb-2">
        {badges.map((badge, index) => (
          <span
            key={index}
            className="bg-primary bg-opacity-20 text-primary text-xs px-2 py-1 rounded-full"
          >
            {badge}
          </span>
        ))}
      </div>
    );
  };

  // ✅ Fonction pour afficher la note
  const renderRating = () => {
    if (!dish.rating) return null;
    
    return (
      <div className="flex items-center space-x-1 mb-2">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-sm text-gray-600">{dish.rating}</span>
      </div>
    );
  };

  // ✅ Fonction pour afficher le temps de préparation
  const renderPreparationTime = () => {
    if (!dish.preparationTime) return null;
    
    return (
      <div className="flex items-center space-x-1 mb-2">
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">{dish.preparationTime} min</span>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
      >
        {/* Image du plat */}
        <div className="relative">
          <img
            src={dish.image || '/api/placeholder/300/200'}
            alt={dish.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/200';
            }}
          />
          
          {/* Badge options */}
          {dish.hasOptions && (
            <div className="absolute top-2 right-2 bg-warning text-white text-xs px-2 py-1 rounded-full">
              Options
            </div>
          )}
        </div>
        
        <div className="p-4">
          {/* En-tête du plat */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-dark mb-1 line-clamp-1">{dish.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
              {dish.description}
            </p>
            
            {/* Badges diététiques */}
            {renderDietaryBadges()}
            
            {/* Note et temps de préparation */}
            <div className="flex items-center justify-between">
              {renderRating()}
              {renderPreparationTime()}
            </div>
          </div>
          
          {/* Prix et actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">
                {(dish.price || 0).toFixed(2)}FC
              </span>
              {dish.hasOptions && selectedOption && (
                <span className="text-xs text-gray-500">
                  Option: {selectedOption.name}
                </span>
              )}
            </div>
            
            {quantity > 0 ? (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDecrease}
                  className="w-8 h-8 rounded-full bg-error text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  disabled={isAddingToCart}
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                
                <span className="text-lg font-semibold text-dark min-w-[2rem] text-center">
                  {quantity}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleIncrease}
                  className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                  disabled={isAddingToCart}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleView}
                  className="bg-gray-200 text-dark px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-1"
                  disabled={isAddingToCart}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Voir</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAdd}
                  disabled={isAddingToCart}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isAddingToCart
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary text-dark hover:bg-opacity-80'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isAddingToCart ? 'Ajout...' : 'Ajouter'}
                    {dish.hasOptions && selectedOption ? `: ${selectedOption.name}` : ''}
                  </span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal des options */}
      {showOptionModal && (
        <OptionModal
          dish={dish}
          onSelectOption={handleSelectOption}
          onClose={() => setShowOptionModal(false)}
        />
      )}
    </>
  );
};

export default DishCard;