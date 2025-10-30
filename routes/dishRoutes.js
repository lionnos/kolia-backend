const express = require('express');
const {
  getDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  searchDishes
} = require('../controllers/dishController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', getDishes);
router.get('/search', searchDishes);
router.get('/:id', getDishById);

// Routes protégées
router.use(protect);

router.post('/', authorize('restaurant'), validate(schemas.dish), createDish);
router.put('/:id', authorize('restaurant'), updateDish);
router.delete('/:id', authorize('restaurant'), deleteDish);

module.exports = router;