const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByOwner,
  updateRestaurantStatus,
  getRestaurantStats
} = require('../controllers/restaurantController');
const { authenticate, authorize, checkOwnership } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');
const Restaurant = require('../models/Restaurant');

const router = express.Router();


// 1. ROUTES SPÉCIFIQUES (DOIVENT ÊTRE EN PREMIER)
// @route   GET /api/restaurants/owner/me
router.get('/owner/me', 
  authenticate, 
  authorize('restaurant', 'admin'), 
  getRestaurantsByOwner // ✅ Cette route sera atteinte
);

// 2. ROUTES DYNAMIQUES AVEC SOUS-CHEMIN
// @route   PUT /api/restaurants/:id/status
router.put('/:id/status', 
  authenticate, 
  authorize('admin'), 
  updateRestaurantStatus
);

// @route   GET /api/restaurants/:id/stats
router.get('/:id/stats', 
  authenticate, 
  checkOwnership(Restaurant), 
  getRestaurantStats
);


// 3. ROUTES SIMPLES (GÉNÉRALES ET DYNAMIQUES)

// @route   GET /api/restaurants
router.get('/', getRestaurants);

// @route   POST /api/restaurants
router.post('/', 
  authenticate, 
  authorize('restaurant', 'admin'), 
  validate(schemas.createRestaurant), 
  createRestaurant
);

// @route   PUT /api/restaurants/:id
router.put('/:id', 
  authenticate, 
  checkOwnership(Restaurant), 
  updateRestaurant
);

// @route   DELETE /api/restaurants/:id
router.delete('/:id', 
  authenticate, 
  checkOwnership(Restaurant), 
  deleteRestaurant
);

// @route   GET /api/restaurants/:id
// ✅ CELLE-CI DOIT ÊTRE LA DERNIÈRE des routes GET simples.
router.get('/:id', getRestaurant); 


module.exports = router;