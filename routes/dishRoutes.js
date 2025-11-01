// dishRoutes.js - Version corrigée
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

// --- ROUTES PUBLIQUES (Ordre corrigé : Spécifique > Dynamique) ---

router.get('/search', searchDishes); // 1. Spécifique
router.get('/restaurant/:restaurantId', getDishesByRestaurant); // 2. Spécifique (publique, résout le 401 si 'protect' est plus bas)
router.get('/:id', getDishById); // 3. Dynamique
router.get('/', getDishes); // 4. Générale


// --- ROUTES PROTÉGÉES ---
// Nous utilisons le 'protect' par ligne pour la clarté et la flexibilité
router.post('/', protect, authorize('restaurant'), validate(schemas.dish), createDish);
router.put('/:id', protect, authorize('restaurant'), updateDish);
router.delete('/:id', protect, authorize('restaurant'), deleteDish);

module.exports = router;
