const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
// Record payment
router.post('/',protect, paymentController.recordPayment);

module.exports = router;
