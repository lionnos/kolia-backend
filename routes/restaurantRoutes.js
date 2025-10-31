// restaurantRoutes.js - VERSION CORRIGÉE
const express = require('express');
const router = express.Router();

// Import des controllers
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

const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

// --- ROUTES PUBLIQUES ---
router.get('/', getRestaurants);

// ⚠️ CRITIQUE : getRestaurantById DOIT ÊTRE APRÈS les routes spécifiques
// mais AVANT les routes avec sous-ressources
router.get('/:id', getRestaurantById);

// Routes avec sous-ressources
router.get('/:id/dishes', getRestaurantDishes);

// --- ROUTES PROTÉGÉES ---
router.use(protect); // Applique protect à toutes les routes suivantes

router.post('/', authorize('restaurant'), validate(schemas.restaurant), createRestaurant);
router.put('/:id', authorize('restaurant'), updateRestaurant);
router.delete('/:id', authorize('restaurant', 'admin'), deleteRestaurant);
router.get('/:id/orders', authorize('restaurant'), getRestaurantOrders);
router.patch('/:id/status', authorize('restaurant'), updateRestaurantStatus);

module.exports = router;