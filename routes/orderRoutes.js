const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
// Place an order
router.get('/by-delivery-boy', protect,orderController.getOrdersByDeliveryBoy);
router.get('/user/:userId',protect, orderController.getOrdersByUser);
router.post('/',protect, orderController.placeOrder);
router.post('/assign-delivery-boy', orderController.assignDeliveryBoyToOrder);
// Get orders by user


router.put('/order/:orderId/status', orderController.updateOrderStatus);
       router.route('/razorpay/order').post(protect, orderController.createRazorpayOrderController);
// routes/orderRoutes.js





module.exports = router;
