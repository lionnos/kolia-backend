import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Star, Info } from 'lucide-react';

// Modal pour les options (existant)
export const OptionModal = ({ dish, onSelectOption, onClose }) => {
  if (!dish || !dish.hasOptions) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-dark">{dish.name}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-error"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">Veuillez choisir une option :</p>
          
          <div className="space-y-3">
            {dish.options.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectOption(option)}
                className="w-full p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-primary hover:bg-opacity-10 transition-colors"
              >
                <span className="text-left">
                  {option.name}
                </span>
                <span className="font-semibold text-primary">
                  {option.price.toFixed(0)}FC
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Nouveau modal pour les détails du plat
export const DishDetailModal = ({ dish, onClose }) => {
  if (!dish) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-dark mb-2">{dish.name}</h2>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center text-warning">
              <Star className="w-5 h-5 fill-current" />
              <span className="ml-1 font-semibold">4.8</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="ml-1">20-30 min</span>
            </div>
            <span className="text-xl font-bold text-primary">
              {dish.price.toFixed(2)}FC
            </span>
          </div>

          <p className="text-gray-700 mb-6">{dish.description}</p>

          {dish.hasOptions && dish.options && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Options disponibles</h3>
              <div className="space-y-2">
                {dish.options.map(option => (
                  <div key={option.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span>{option.name}</span>
                    <span className="font-semibold">{option.price.toFixed(2)}FC</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Ingrédients principaux
            </h3>
            <p className="text-gray-600">
              {dish.ingredients || "Ingrédients frais et de qualité premium."}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-primary text-dark rounded-lg hover:bg-opacity-80 transition-colors font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Export par défaut (OptionModal) pour la rétrocompatibilité
export default OptionModal;