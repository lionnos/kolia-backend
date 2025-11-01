// restaurantRoutes.js - Version corrigée
const express = require('express');
const router = express.Router();
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

// --- ROUTES PUBLIQUES (Ordre corrigé : Sous-ressources > Dynamique > Générale) ---

// 1. Routes avec sous-ressources (DOIVENT ÊTRE EN PREMIERES)
router.get('/owner/me', protect, authorize('restaurant'), getOwnerRestaurant); // Si vous l'avez, elle va ici
router.get('/:id/dishes', getRestaurantDishes); 

// 2. Route DYNAMIQUE PAR ID (Doit venir après les sous-ressources)
router.get('/:id', getRestaurantById);

// 3. Route GÉNÉRALE
router.get('/', getRestaurants);

// --- ROUTES PROTÉGÉES ---

router.post('/', protect, authorize('restaurant'), validate(schemas.restaurant), createRestaurant);
router.put('/:id', protect, authorize('restaurant'), updateRestaurant);
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteRestaurant);

// Sous-ressources Protégées
router.get('/:id/orders', protect, authorize('restaurant'), getRestaurantOrders);
router.patch('/:id/status', protect, authorize('restaurant'), updateRestaurantStatus);

module.exports = router;