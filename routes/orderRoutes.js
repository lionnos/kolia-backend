const express = require('express');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getRestaurantOrders,
  cancelOrder,
  assignDriver
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// --- 1. ROUTES PUBLIQUES (Si nécessaire) ---

// 💡 NOTE : La création d'une commande est souvent publique au début d'un site
// avant le paiement (ou elle est gérée par le frontend).
// Si vous exigez un utilisateur connecté, gardez le 'protect' ci-dessous.
// router.post('/', validate(schemas.order), createOrder); 

// --- 2. ROUTES PRIVÉES SPÉCIFIQUES (DOIVENT ÊTRE EN PREMIER) ---

// @route GET /api/orders/my-orders
// @desc Obtenir les commandes de l'utilisateur connecté
router.get('/my-orders', protect, authorize('client'), getUserOrders);

// @route GET /api/orders/restaurant/:restaurantId
// @desc Obtenir les commandes d'un restaurant spécifique
router.get('/restaurant/:restaurantId', protect, authorize('restaurant'), getRestaurantOrders);


// --- 3. ROUTES PRIVÉES GÉNÉRALES ---

// @route GET /api/orders
// @desc Obtenir TOUTES les commandes (admin seulement)
router.get('/', protect, authorize('admin'), getOrders);

// @route POST /api/orders
// @desc Créer une commande (doit être protégé pour associer l'ID client)
router.post('/', protect, authorize('client'), validate(schemas.order), createOrder);

// @route GET /api/orders/:id
// @desc Obtenir une commande par ID (doit être après les routes spécifiques ci-dessus)
router.get('/:id', protect, getOrderById);

// @route PATCH /api/orders/:id/status
router.patch('/:id/status', protect, authorize('restaurant', 'livreur', 'admin'), updateOrderStatus);

// @route PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', protect, authorize('client', 'admin'), cancelOrder);

// @route PATCH /api/orders/:id/assign-driver
router.patch('/:id/assign-driver', protect, authorize('restaurant', 'admin'), assignDriver);


module.exports = router;