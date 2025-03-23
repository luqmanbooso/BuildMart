const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get user's orders - add this before the general GET route
router.get('/', orderController.getUserOrders);

// Create a new order
router.post('/', orderController.createOrder);

// Get a specific order
router.get('/:id', orderController.getOrderById);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;