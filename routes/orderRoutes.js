const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
// Place an order
router.post('/',protect, orderController.placeOrder);

// Get orders by user
router.get('/user/:userId',protect, orderController.getOrdersByUser);

router.put('/order/:orderId/status', orderController.updateOrderStatus);
       router.route('/razorpay/order').post(protect, orderController.createRazorpayOrderController);
// routes/orderRoutes.js
router.post('/assign-delivery-boy', orderController.assignDeliveryBoy);


router.get('/by-delivery-boy/:deliveryBoyId', orderController.getOrdersByDeliveryBoy);

module.exports = router;
