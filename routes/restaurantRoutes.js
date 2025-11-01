// restaurantRoutes.js - AVEC MOCKING POUR LA DÉMO
const express = require('express');
const router = express.Router();

// Importez les contrôleurs originaux pour les autres routes
const { 
  getRestaurants, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant,
  getRestaurantDishes,
  getRestaurantOrders,
  updateRestaurantStatus
} = require('../controllers/restaurantController');

// ✅ Importez le mock controller
const { getMockRestaurantById } = require('../controllers/mockControllers'); 


const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

// --- ROUTES PUBLIQUES (Ordre corrigé et Mocké) ---

// 1. Routes avec sous-ressources (Laissez celle-ci telle quelle, elle n'est pas le problème)
// Assurez-vous que getOwnerRestaurant est importé ou supprimez cette ligne si non définie.
router.get('/owner/me', protect, authorize('restaurant'), getOwnerRestaurant); 
router.get('/:id/dishes', getRestaurantDishes); 

// 2. Route DYNAMIQUE PAR ID
router.get('/:id', getMockRestaurantById); // ✅ UTILISE LE MOCK

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