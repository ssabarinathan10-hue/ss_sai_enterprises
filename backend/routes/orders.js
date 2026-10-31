const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, validateCoupon, updateOrderStatus } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);
router.get('/', getOrders);
router.post('/', createOrder);
router.post('/validate-coupon', validateCoupon);
router.get('/:id', getOrderById);
router.put('/:id/status', adminMiddleware, updateOrderStatus);

module.exports = router;

