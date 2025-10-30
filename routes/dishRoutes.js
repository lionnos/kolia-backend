const express = require('express');
const {
  getDishes,
  getDish,
  createDish,
  updateDish,
  deleteDish,
  getDishesByRestaurant, // ⬅️ On veut que cette route fonctionne !
  searchDishes,
  updateDishAvailability
} = require('../controllers/dishController');
// ... imports

const router = express.Router();

// 1. ROUTES SPÉCIFIQUES (DOIVENT ÊTRE EN PREMIER)

// @route   GET /api/dishes/search
// ✅ Celle-ci est très spécifique et doit être avant :id
router.get('/search', searchDishes);

// @route   GET /api/dishes/restaurant/:restaurantId
// ✅ Celle-ci est aussi très spécifique et doit être avant :id
router.get('/restaurant/:restaurantId', getDishesByRestaurant);


// 2. ROUTES SIMPLES ET DYNAMIQUES (APRÈS LES SPÉCIFIQUES)

// @route   GET /api/dishes
router.get('/', getDishes);

// @route   POST /api/dishes
router.post('/', 
  authenticate, 
  authorize('restaurant', 'admin'), 
  validate(schemas.createDish), 
  createDish
);

// @route   PUT /api/dishes/:id/availability
router.put('/:id/availability', 
  authenticate, 
  checkOwnership(Dish), 
  updateDishAvailability
);

// @route   PUT /api/dishes/:id
router.put('/:id', 
  authenticate, 
  checkOwnership(Dish), 
  updateDish
);

// @route   DELETE /api/dishes/:id
router.delete('/:id', 
  authenticate, 
  checkOwnership(Dish), 
  deleteDish
);

// @route   GET /api/dishes/:id
// ✅ CELLE-CI DOIT ÊTRE LA DERNIÈRE des routes GET simples.
router.get('/:id', getDish); 


module.exports = router;