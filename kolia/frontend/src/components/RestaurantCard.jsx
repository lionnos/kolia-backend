import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, DollarSign, Truck, Shield } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  // ✅ Fonction pour déterminer la couleur du statut avec valeurs sécurisées
  const getStatusColor = (status) => {
    const statusValue = status?.toLowerCase() || 'closed';
    switch (statusValue) {
      case 'open':
      case 'ouvert':
        return 'bg-success text-white';
      case 'closed':
      case 'ferme':
        return 'bg-error text-white';
      case 'busy':
      case 'occupe':
        return 'bg-warning text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // ✅ Fonction pour déterminer le texte du statut avec valeurs sécurisées
  const getStatusText = (status) => {
    const statusValue = status?.toLowerCase() || 'closed';
    switch (statusValue) {
      case 'open':
      case 'ouvert':
        return 'Ouvert';
      case 'closed':
      case 'ferme':
        return 'Fermé';
      case 'busy':
      case 'occupe':
        return 'Occupé';
      default:
        return 'Indisponible';
    }
  };

  // ✅ Fonction pour formater le prix de livraison avec valeurs sécurisées
  const formatDeliveryFee = (fee) => {
    const feeValue = parseFloat(fee) || 0;
    if (feeValue === 0) return 'Livraison gratuite';
    return `${feeValue.toFixed(0)}FC`;
  };

  // ✅ Vérifier si le restaurant propose la livraison (valeur sécurisée)
  const hasDelivery = restaurant?.deliveryAvailable !== false;

  // ✅ Vérifier si le restaurant est certifié (valeur sécurisée)
  const isCertified = restaurant?.certified || restaurant?.isCertified;

  // ✅ Obtenir les valeurs sécurisées des props
  const restaurantId = restaurant?.id || restaurant?.restaurantId || 'unknown';
  const restaurantName = restaurant?.name || 'Nom non disponible';
  const restaurantDescription = restaurant?.description || 'Aucune description disponible';
  const restaurantRating = restaurant?.rating || 'N/A';
  const deliveryTime = restaurant?.deliveryTime || 'Non spécifié';
  const deliveryFee = restaurant?.deliveryFee || 0;
  const commune = restaurant?.commune || restaurant?.address || 'Localisation non spécifiée';
  const category = restaurant?.category;
  const dishCount = restaurant?.dishCount || restaurant?.dishes?.length;
  const imageUrl = restaurant?.image || '/api/placeholder/400/250';
  const status = restaurant?.status || 'closed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
    >
      <Link to={`/restaurant/${restaurantId}`} className="block">
        <div className="relative">
          {/* Image du restaurant */}
          <img
            src={imageUrl}
            alt={restaurantName}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/api/placeholder/400/250';
            }}
          />
          
          {/* Badge de statut */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </span>
            
            {/* Badge certifié */}
            {isCertified && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-500 text-white font-medium flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Certifié</span>
              </span>
            )}
          </div>

          {/* Badge de livraison */}
          {!hasDelivery && (
            <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-gray-500 text-white font-medium">
              Sur place uniquement
            </span>
          )}
        </div>
        
        <div className="p-4">
          {/* Nom et description */}
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-dark mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {restaurantName}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {restaurantDescription}
            </p>
          </div>
          
          {/* Métriques : Note, temps, prix */}
          <div className="flex items-center space-x-4 mb-3">
            {/* Note */}
            <div className="flex items-center space-x-1" title={`Note: ${restaurantRating}`}>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">
                {restaurantRating}
              </span>
            </div>
            
            {/* Temps de livraison */}
            {hasDelivery && (
              <div className="flex items-center space-x-1" title="Temps de livraison">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {deliveryTime}
                </span>
              </div>
            )}
            
            {/* Frais de livraison */}
            {hasDelivery && (
              <div className="flex items-center space-x-1" title="Frais de livraison">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {formatDeliveryFee(deliveryFee)}
                </span>
              </div>
            )}
          </div>
          
          {/* Localisation et catégorie */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1" title="Localisation">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {commune}
              </span>
            </div>
            
            {/* Catégorie */}
            {category && (
              <span 
                className="text-xs px-2 py-1 bg-primary bg-opacity-20 rounded-full text-primary font-medium"
                title={`Catégorie: ${category}`}
              >
                {category}
              </span>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {/* Nombre de plats */}
              {dishCount > 0 && (
                <span>{dishCount} plat(s)</span>
              )}
              
              {/* Service de livraison */}
              {hasDelivery && (
                <div className="flex items-center space-x-1">
                  <Truck className="w-3 h-3" />
                  <span>Livraison</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RestaurantCard;