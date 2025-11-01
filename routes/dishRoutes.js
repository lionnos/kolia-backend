// dishRoutes.js - AVEC MOCKING POUR LA DÉMO
const express = require('express');

// Importez les contrôleurs originaux pour les autres routes
const {
  getDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  searchDishes,
  // getDishesByRestaurant <-- Contrôleur original non utilisé ici
} = require('../controllers/dishController');

// ✅ Importez le mock controller
const { getMockDishesByRestaurant } = require('../controllers/mockControllers'); 

const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// --- ROUTES PUBLIQUES (Ordre corrigé et Mocké) ---
router.get('/', getDishes);
router.get('/search', searchDishes);

// 🛑 ATTENTION : L'ordre est CRITIQUE. /restaurant/:id DOIT VENIR AVANT /:id
router.get('/restaurant/:id', getMockDishesByRestaurant); // ✅ UTILISE LE MOCK
router.get('/:id', getDishById); // 3. Dynamique (doit venir après)

// --- ROUTES PROTÉGÉES ---
router.post('/', protect, authorize('restaurant'), validate(schemas.dish), createDish);
router.put('/:id', protect, authorize('restaurant'), updateDish);
router.delete('/:id', protect, authorize('restaurant'), deleteDish);

module.exports = router;