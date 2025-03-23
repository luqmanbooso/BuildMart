const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route for getting orders (with or without userId)
router.get('/', orderController.getUserOrders);

// Create a new order
router.post('/', orderController.createOrder);

// Route for custom order number lookup
router.patch('/byOrderNumber/:orderNumber/status', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }
    
    // Try to find by any identifier
    let order;
    
    // First try to find by MongoDB ObjectId if it's valid
    if (/^[0-9a-fA-F]{24}$/.test(orderNumber)) {
      order = await Order.findById(orderNumber);
    }
    
    // If not found by ObjectId, try finding by custom fields
    if (!order) {
      order = await Order.findOne({ orderNumber });
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.orderStatus = status;
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Get a specific order by ID
router.get('/:id', orderController.getOrderById);

// Update order status by ID
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;