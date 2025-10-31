const express = require('express');
const {
  getDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  searchDishes,
  getDishesByRestaurant // ⬅️ NOUVELLE FONCTION IMPORTÉE
} = require('../controllers/dishController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// --- ROUTES PUBLIQUES ---
router.get('/', getDishes);
router.get('/search', searchDishes);
router.get('/:id', getDishById);

// ✅ ROUTE MANQUANTE AJOUTÉE - Doit être publique
router.get('/restaurant/:restaurantId', getDishesByRestaurant);

// --- ROUTES PROTÉGÉES ---
router.use(protect);

router.post('/', authorize('restaurant'), validate(schemas.dish), createDish);
router.put('/:id', authorize('restaurant'), updateDish);
router.delete('/:id', authorize('restaurant'), deleteDish);

module.exports = router;