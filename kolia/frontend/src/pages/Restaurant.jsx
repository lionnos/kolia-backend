import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Phone, DollarSign } from 'lucide-react';
import { restaurantAPI, dishAPI } from '../api/api'; // ✅ Changé vers l'API Axios
import DishCard from '../components/DishCard';
import { DishDetailModal } from '../components/OptionModal';
import AdvancedFilters from '../components/AdvancedFilters';
import LoadingSpinner from '../components/LoadingSpinner';

const Restaurant = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedDish, setSelectedDish] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 100000],
    dietary: [],
    sortBy: 'popularity'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadRestaurant();
    loadRestaurantDishes();
  }, [id]);

  const loadRestaurant = async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ Utilisation d'Axios via restaurantAPI
      const response = await restaurantAPI.getById(id);
      
      // ✅ Axios retourne les données dans response.data
      const restaurantData = response.data.restaurant || response.data;
      
      setRestaurant(restaurantData);
      
    } catch (error) {
      console.error('Error loading restaurant:', error);
      
      // ✅ Gestion d'erreur améliorée avec Axios
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors du chargement du restaurant';
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantDishes = async () => {
    setLoadingDishes(true);
    try {
      // ✅ Utilisation d'Axios via dishAPI pour les plats du restaurant
      const response = await dishAPI.getByRestaurant(id);
      
      // ✅ Axios retourne les données dans response.data
      const dishesData = response.data.dishes || response.data;
      
      setDishes(dishesData);
      
    } catch (error) {
      console.error('Error loading restaurant dishes:', error);
      
      // ✅ Gestion d'erreur avec message
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors du chargement des plats';
      
      console.log('Error loading dishes:', errorMessage);
      
    } finally {
      setLoadingDishes(false);
    }
  };

  const handleViewDish = (dish) => {
    setSelectedDish(dish);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDish(null);
  };

  // Fonction pour filtrer et trier les plats
  const filterAndSortDishes = () => {
    if (!dishes || dishes.length === 0) return [];

    let filteredDishes = dishes.filter(dish => {
      // Filtre par catégorie
      if (selectedCategory !== 'Tous' && dish.category !== selectedCategory) {
        return false;
      }
      
      // Filtre par prix
      if (dish.price < activeFilters.priceRange[0] || dish.price > activeFilters.priceRange[1]) {
        return false;
      }
      
      // Filtre par recherche
      if (searchQuery && 
          !dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !dish.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(dish.ingredients && dish.ingredients.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Filtres diététiques
      if (activeFilters.dietary.length > 0) {
        if (activeFilters.dietary.includes('Végétarien') && !dish.isVegetarian) return false;
        if (activeFilters.dietary.includes('Végan') && !dish.isVegan) return false;
        if (activeFilters.dietary.includes('Sans gluten') && !dish.isGlutenFree) return false;
        if (activeFilters.dietary.includes('Épicé') && !dish.isSpicy) return false;
        if (activeFilters.dietary.includes('Populaire') && (!dish.rating || dish.rating < 4.5)) return false;
      }
      
      return true;
    });

    // Tri des résultats
    filteredDishes.sort((a, b) => {
      switch (activeFilters.sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'popularity':
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    return filteredDishes;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Restaurant non trouvé</h2>
          <p className="text-gray-600">Le restaurant que vous cherchez n'existe pas.</p>
          {error && (
            <p className="text-error text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  const categories = ['Tous', ...new Set(dishes.map(dish => dish.category))];
  const filteredDishes = filterAndSortDishes();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <section className="relative">
        <div className="h-64 md:h-80">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-lg mb-4">{restaurant.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{restaurant.rating || 'N/A'}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant.deliveryTime || 'Non spécifié'}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>Livraison: {restaurant.deliveryFee || 0}FC</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{restaurant.commune || 'Adresse non spécifiée'}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{restaurant.phone || 'Téléphone non spécifié'}</span>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 bg-error bg-opacity-80 text-white p-3 rounded-lg text-sm"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Menu */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-dark text-center mb-8">Notre Menu</h2>
          
          {/* Filtres avancés */}
          <AdvancedFilters
            onFilterChange={setActiveFilters}
            onSearch={setSearchQuery}
          />
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-dark'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
          
          {/* Indicateur de chargement des plats */}
          {loadingDishes && (
            <div className="text-center py-4">
              <p className="text-gray-600">Chargement des plats...</p>
            </div>
          )}
          
          {/* Résultats de recherche */}
          {searchQuery && (
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                {filteredDishes.length} résultat(s) trouvé(s) pour "{searchQuery}"
              </p>
            </div>
          )}
          
          {/* Dishes Grid */}
          {!loadingDishes && filteredDishes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {dishes.length === 0 
                  ? 'Aucun plat disponible pour ce restaurant.' 
                  : 'Aucun plat ne correspond à vos critères de recherche.'
                }
              </p>
              {(searchQuery || activeFilters.dietary.length > 0 || selectedCategory !== 'Tous') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilters({
                      priceRange: [0, 100000],
                      dietary: [],
                      sortBy: 'popularity'
                    });
                    setSelectedCategory('Tous');
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map(dish => (
                <DishCard 
                  key={dish.id} 
                  dish={dish} 
                  restaurant={restaurant} 
                  onView={handleViewDish}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal de détail du plat */}
      {showDetailModal && selectedDish && (
        <DishDetailModal
          dish={selectedDish}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default Restaurant;