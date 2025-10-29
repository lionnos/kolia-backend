import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, DollarSign, Search } from 'lucide-react';

const AdvancedFilters = ({ onFilterChange, onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    dietary: [],
    sortBy: 'popularity'
  });

  const dietaryOptions = ['Végétarien', 'Végan', 'Sans gluten', 'Épicé', 'Populaire'];
  const sortOptions = [
    { value: 'popularity', label: 'Popularité' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'name', label: 'Ordre alphabétique' }
  ];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDietaryToggle = (option) => {
    const newDietary = filters.dietary.includes(option)
      ? filters.dietary.filter(item => item !== option)
      : [...filters.dietary, option];
    
    handleFilterChange({ ...filters, dietary: newDietary });
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Barre de recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un plat, un ingrédient..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>

        {/* Bouton filtre */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-3 bg-primary text-dark rounded-lg hover:bg-opacity-80 transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span>Filtres</span>
          {filters.dietary.length > 0 && (
            <span className="bg-warning text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {filters.dietary.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* Panneau des filtres */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filtres avancés</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-error">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plage de prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fourchette de prix
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange({
                    ...filters,
                    priceRange: [0, parseInt(e.target.value)]
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0 FC</span>
                  <span>{filters.priceRange[1].toLocaleString()} FC</span>
                </div>
              </div>
            </div>

            {/* Options diététiques */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options diététiques
              </label>
              <div className="space-y-2">
                {dietaryOptions.map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.dietary.includes(option)}
                      onChange={() => handleDietaryToggle(option)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  sortBy: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => handleFilterChange({
                priceRange: [0, 100000],
                dietary: [],
                sortBy: 'popularity'
              })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Appliquer
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedFilters;