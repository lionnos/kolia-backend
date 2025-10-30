const express = require('express');
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantDishes,
  getRestaurantOrders,
  updateRestaurantStatus
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/dishes', getRestaurantDishes);

// Routes protégées
router.use(protect);

router.post('/', authorize('restaurant'), validate(schemas.restaurant), createRestaurant);
router.put('/:id', authorize('restaurant'), updateRestaurant);
router.delete('/:id', authorize('restaurant', 'admin'), deleteRestaurant);
router.get('/:id/orders', authorize('restaurant'), getRestaurantOrders);
router.patch('/:id/status', authorize('restaurant'), updateRestaurantStatus);

module.exports = router;