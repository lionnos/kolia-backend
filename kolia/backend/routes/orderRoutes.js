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

// Routes protégées
router.use(protect);

router.get('/', authorize('admin'), getOrders);
router.get('/my-orders', authorize('client'), getUserOrders);
router.get('/restaurant/:restaurantId', authorize('restaurant'), getRestaurantOrders);
router.get('/:id', getOrderById);
router.post('/', authorize('client'), validate(schemas.order), createOrder);
router.patch('/:id/status', authorize('restaurant', 'livreur', 'admin'), updateOrderStatus);
router.patch('/:id/cancel', authorize('client', 'admin'), cancelOrder);
router.patch('/:id/assign-driver', authorize('restaurant', 'admin'), assignDriver);

module.exports = router;