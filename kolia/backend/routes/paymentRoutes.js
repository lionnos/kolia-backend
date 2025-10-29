const express = require('express');
const {
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  processRefund
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes protégées
router.use(protect);

router.post('/initialize', authorize('client'), initializePayment);
router.post('/verify', verifyPayment);
router.get('/:transactionId/status', getPaymentStatus);
router.post('/:transactionId/refund', authorize('admin'), processRefund);

module.exports = router;