import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, X, Truck } from 'lucide-react';
import { restaurantAPI, driverAPI } from '../api/api'; // ✅ Changé vers l'API Axios
import { useAuth } from '../contexts/AuthContext';
import { mockData } from '../data/mockData';
import RestaurantCard from '../components/RestaurantCard';
import DeliveryDriverCard from '../components/DeliveryDriverCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [deliveryDrivers, setDeliveryDrivers] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    commune: 'Tous',
    category: 'Tous',
    dietary: [],
    priceRange: [0, 100000],
    sortBy: 'popularity'
  });
  const [driverFilters, setDriverFilters] = useState({
    area: 'Tous',
    available: true
  });
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadRestaurants();
    if (user?.role === 'restaurant') {
      loadDeliveryDrivers();
    }
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchQuery, filters]);

  useEffect(() => {
    if (user?.role === 'restaurant') {
      loadDeliveryDrivers();
    }
  }, [user, driverFilters]);

  const loadRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ Utilisation d'Axios via restaurantAPI
      const response = await restaurantAPI.getAll();
      
      // ✅ Axios retourne les données dans response.data
      const restaurantsData = response.data.restaurants || response.data;
      
      setRestaurants(restaurantsData);
      
    } catch (error) {
      console.error('Error loading restaurants:', error);
      
      // ✅ Gestion d'erreur améliorée avec Axios
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors du chargement des restaurants';
      
      setError(errorMessage);
      
      // ✅ Fallback vers les données mock si l'API échoue
      console.log('Using mock data as fallback');
      setRestaurants(mockData.restaurants || []);
      
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryDrivers = async () => {
    setLoadingDrivers(true);
    try {
      // ✅ Utilisation d'Axios via driverAPI
      const response = await driverAPI.getAvailableOrders();
      
      // ✅ Axios retourne les données dans response.data
      const driversData = response.data.drivers || response.data;
      
      setDeliveryDrivers(driversData);
      
    } catch (error) {
      console.error('Error loading delivery drivers:', error);
      
      // ✅ Gestion d'erreur avec fallback mock
      console.log('Using mock drivers data as fallback');
      setDeliveryDrivers(mockData.deliveryDrivers || []);
      
    } finally {
      setLoadingDrivers(false);
    }
  };

  const filterRestaurants = () => {
    if (!restaurants.length) return;

    let results = restaurants.filter(restaurant => {
      // Filtre par commune
      if (filters.commune !== 'Tous' && restaurant.commune !== filters.commune) {
        return false;
      }
      
      // Filtre par catégorie
      if (filters.category !== 'Tous' && restaurant.category !== filters.category) {
        return false;
      }
      
      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        
        // Recherche dans le nom du restaurant
        if (restaurant.name.toLowerCase().includes(query)) {
          return true;
        }
        
        // Recherche dans la description du restaurant
        if (restaurant.description?.toLowerCase().includes(query)) {
          return true;
        }
        
        // Recherche dans les plats du restaurant
        const hasMatchingDish = restaurant.dishes?.some(dish => {
          // Recherche dans le nom du plat
          if (dish.name.toLowerCase().includes(query)) {
            return true;
          }
          
          // Recherche dans la description du plat
          if (dish.description?.toLowerCase().includes(query)) {
            return true;
          }
          
          // Recherche dans les ingrédients du plat
          if (dish.ingredients?.toLowerCase().includes(query)) {
            return true;
          }
          
          return false;
        });
        
        if (!hasMatchingDish) {
          return false;
        }
      }
      
      // Filtres avancés (vérification des plats)
      if (filters.dietary.length > 0 || filters.priceRange[1] < 100000) {
        const hasMatchingDish = restaurant.dishes?.some(dish => {
          // Filtre par prix
          if (dish.price < filters.priceRange[0] || dish.price > filters.priceRange[1]) {
            return false;
          }
          
          // Filtres diététiques
          if (filters.dietary.length > 0) {
            if (filters.dietary.includes('Végétarien') && !dish.isVegetarian) return false;
            if (filters.dietary.includes('Végan') && !dish.isVegan) return false;
            if (filters.dietary.includes('Sans gluten') && !dish.isGlutenFree) return false;
            if (filters.dietary.includes('Épicé') && !dish.isSpicy) return false;
            if (filters.dietary.includes('Populaire') && (!dish.rating || dish.rating < 4.5)) return false;
          }
          
          return true;
        });
        
        if (!hasMatchingDish) {
          return false;
        }
      }
      
      return true;
    });

    // Tri des résultats
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'delivery-time':
          return (a.deliveryTime || '').localeCompare(b.deliveryTime || '');
        case 'delivery-fee':
          return (a.deliveryFee || 0) - (b.deliveryFee || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'popularity':
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    setFilteredRestaurants(results);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleDriverFilterChange = (type, value) => {
    setDriverFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleDietaryToggle = (option) => {
    const newDietary = filters.dietary.includes(option)
      ? filters.dietary.filter(item => item !== option)
      : [...filters.dietary, option];
    
    setFilters(prev => ({ ...prev, dietary: newDietary }));
  };

  // ✅ Fonction améliorée pour assigner un livreur
  const handleDriverAssign = async (driverId) => {
    try {
      // ✅ Utilisation d'Axios via driverAPI
      const response = await driverAPI.acceptOrder(driverId);
      
      console.log('Livreur assigné avec succès:', response.data);
      
      // ✅ Recharger la liste des livreurs après assignation
      loadDeliveryDrivers();
      
      // ✅ Afficher un message de succès (vous pouvez ajouter un toast)
      alert('Livreur assigné avec succès!');
      
    } catch (error) {
      console.error('Erreur lors de l\'assignation du livreur:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors de l\'assignation du livreur';
      
      alert(errorMessage);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      commune: 'Tous',
      category: 'Tous',
      dietary: [],
      priceRange: [0, 100000],
      sortBy: 'popularity'
    });
  };

  const dietaryOptions = ['Végétarien', 'Végan', 'Sans gluten', 'Épicé', 'Populaire'];
  const sortOptions = [
    { value: 'popularity', label: 'Popularité' },
    { value: 'rating', label: 'Meilleures notes' },
    { value: 'delivery-time', label: 'Temps de livraison' },
    { value: 'delivery-fee', label: 'Frais de livraison' },
    { value: 'name', label: 'Ordre alphabétique' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-secondary to-accent py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-dark mb-6">
              KOLIA
            </h1>
            <p className="text-xl text-dark mb-8 max-w-2xl mx-auto">
              Découvrez les meilleurs restaurants de Bukavu et faites-vous livrer vos plats préférés
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un restaurant, un plat ou un ingrédient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-error"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtres de base */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {/* Filtre par lieu */}
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-dark" />
                <select
                  value={filters.commune}
                  onChange={(e) => handleFilterChange('commune', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {mockData.communes.map(commune => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>

              {/* Filtre par type de cuisine */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-dark" />
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {mockData.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bouton filtres avancés */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="mt-4 flex items-center justify-center space-x-2 mx-auto px-4 py-2 bg-white bg-opacity-20 text-dark rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filtres avancés</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Message d'erreur */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-error text-white p-3 rounded-lg text-sm"
          >
            ⚠️ {error} (Utilisation des données de démonstration)
          </motion.div>
        </div>
      )}

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white py-6 shadow-sm"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filtres avancés</h3>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="text-gray-500 hover:text-error"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
             
              {/* Filtre par options diététiques */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options diététiques
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => handleDietaryToggle(option)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        filters.dietary.includes(option)
                          ? 'bg-primary text-dark'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtre par tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Plage de prix */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fourchette de prix: jusqu'à {filters.priceRange[1].toLocaleString()} FC
              </label>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                className="w-full"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mr-2"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Restaurants Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-dark">
              Restaurants Disponibles
            </h2>
            
            {filteredRestaurants.length > 0 && (
              <p className="text-gray-600">
                {filteredRestaurants.length} restaurant(s) trouvé(s)
              </p>
            )}
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">Aucun restaurant trouvé avec ces critères</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-opacity-80 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section des livreurs (uniquement visible pour les restaurants) */}
      {user?.role === 'restaurant' && (
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-dark flex items-center">
                <Truck className="w-8 h-8 mr-2" />
                Livreurs Disponibles
              </h2>
            </div>

            {/* Filtres des livreurs */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-dark mb-4">Filtres des livreurs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone de livraison</label>
                  <select
                    value={driverFilters.area}
                    onChange={(e) => handleDriverFilterChange('area', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="Tous">Toutes les zones</option>
                    <option value="Kadutu">Kadutu</option>
                    <option value="Ibanda">Ibanda</option>
                    <option value="Bagira">Bagira</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                  <select
                    value={driverFilters.available}
                    onChange={(e) => handleDriverFilterChange('available', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value={true}>Disponibles</option>
                    <option value={false}>Tous</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Liste des livreurs */}
            {loadingDrivers ? (
              <LoadingSpinner />
            ) : deliveryDrivers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliveryDrivers.map(driver => (
                  <DeliveryDriverCard 
                    key={driver.id} 
                    driver={driver} 
                    onAssign={handleDriverAssign}
                    showAssignButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Aucun livreur trouvé avec ces critères</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;