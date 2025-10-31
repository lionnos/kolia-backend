const express = require('express');
const {
  getDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  searchDishes,
  getDishesByRestaurant
} = require('../controllers/dishController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// --- ROUTES PUBLIQUES ---
router.get('/', getDishes);
router.get('/search', searchDishes);
router.get('/:id', getDishById);
router.get('/restaurant/:restaurantId', getDishesByRestaurant); // ✅ Doit être publique

// --- ROUTES PROTÉGÉES ---
// ❌ SUPPRIMEZ cette ligne qui rend tout protégé :
// router.use(protect);

// ✅ Appliquez protect individuellement aux routes qui en ont besoin :
router.post('/', protect, authorize('restaurant'), validate(schemas.dish), createDish);
router.put('/:id', protect, authorize('restaurant'), updateDish);
router.delete('/:id', protect, authorize('restaurant'), deleteDish);

module.exports = router;
router.post('/', authorize('restaurant'), validate(schemas.dish), createDish);
router.put('/:id', authorize('restaurant'), updateDish);
router.delete('/:id', authorize('restaurant'), deleteDish);

module.exports = router;