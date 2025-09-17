const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders
} = require('../controllers/orderController');

router.post('/buy', placeOrder);
router.get('/myorders/:userId', getUserOrders);

module.exports = router;
