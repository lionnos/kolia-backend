const express = require('express');
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantDishes,
  getRestaurantOrders,
  updateRestaurantStatus
} = require('../controllers/restaurantController');
// Votre middleware est déjà nommé 'protect', pas besoin de renommer ici
const { protect, authorize } = require('../middleware/authMiddleware'); 
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// --- 1. ROUTES PUBLIQUES SPÉCIFIQUES ---

// @route   GET /api/restaurants/:id/dishes
// @desc    Obtenir les plats d'un restaurant (publique)
// ✅ DOIT ÊTRE AVANT /:id
router.get('/:id/dishes', getRestaurantDishes);


// --- 2. ROUTES PUBLIQUES GÉNÉRALES ---

// @route   GET /api/restaurants
router.get('/', getRestaurants);

// @route   GET /api/restaurants/:id
// @desc    Obtenir un restaurant par ID (publique)
// ✅ DOIT ÊTRE APRÈS /:id/dishes
router.get('/:id', getRestaurantById);


// --- 3. ROUTES PRIVÉES (APPLIQUER protect DIRECTEMENT) ---

// @route   POST /api/restaurants
// @desc    Créer un restaurant
router.post('/', 
    protect, 
    authorize('restaurant'), 
    validate(schemas.restaurant), 
    createRestaurant
);

// @route   PUT /api/restaurants/:id
// @desc    Mettre à jour un restaurant
router.put('/:id', 
    protect, 
    authorize('restaurant'), 
    updateRestaurant
);

// @route   DELETE /api/restaurants/:id
// @desc    Supprimer un restaurant
router.delete('/:id', 
    protect, 
    authorize('restaurant', 'admin'), 
    deleteRestaurant
);

// @route   GET /api/restaurants/:id/orders
// @desc    Obtenir les commandes d'un restaurant
router.get('/:id/orders', 
    protect, 
    authorize('restaurant'), 
    getRestaurantOrders
);

// @route   PATCH /api/restaurants/:id/status
// @desc    Mettre à jour le statut du restaurant
router.patch('/:id/status', 
    protect, 
    authorize('restaurant'), 
    updateRestaurantStatus
);


module.exports = router;