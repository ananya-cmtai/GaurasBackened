const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
// Place an order
router.post('/',protect, orderController.placeOrder);

// Get orders by user
router.get('/user/:userId',protect, orderController.getOrdersByUser);

router.put('/order/:orderId/status', orderController.updateOrderStatus);

module.exports = router;
