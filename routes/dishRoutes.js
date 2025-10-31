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
router.get('/restaurant/:id', getDishesByRestaurant); // ✅ DOIT ÊTRE PUBLIQUE

// --- ROUTES PROTÉGÉES ---
// ⚠️ SUPPRIMEZ CE router.use(protect) S'IL EXISTE
// router.use(protect); // ❌ À SUPPRIMER

// ✅ Appliquez protect individuellement aux routes protégées :
router.post('/', protect, authorize('restaurant'), validate(schemas.dish), createDish);
router.put('/:id', protect, authorize('restaurant'), updateDish);
router.delete('/:id', protect, authorize('restaurant'), deleteDish);

module.exports = router;