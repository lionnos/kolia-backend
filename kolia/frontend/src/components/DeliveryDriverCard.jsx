import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Star, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';

const DeliveryDriverCard = ({ driver, onAssign, showAssignButton = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
    >
      <div className="relative">
        <img
          src={driver.image}
          alt={driver.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          {driver.available ? (
            <div className="bg-success text-white px-2 py-1 rounded-full text-xs flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Disponible
            </div>
          ) : (
            <div className="bg-error text-white px-2 py-1 rounded-full text-xs flex items-center">
              <XCircle className="w-3 h-3 mr-1" />
              Indisponible
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-dark mb-2">{driver.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{driver.description}</p>
        
        <div className="flex items-center mb-2">
          <Star className="w-4 h-4 text-warning mr-1" />
          <span className="text-sm font-medium">{driver.rating}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Truck className="w-4 h-4 mr-1" />
          <span>{driver.vehicle}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>Zones: {driver.deliveryAreas.join(', ')}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Phone className="w-4 h-4 mr-1" />
          <span>{driver.phone}</span>
        </div>
        
        {showAssignButton && driver.available && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAssign(driver.id)}
            className="w-full bg-primary text-dark py-2 rounded-lg font-medium hover:bg-opacity-80 transition-colors"
          >
            Assigner à une commande
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default DeliveryDriverCard;