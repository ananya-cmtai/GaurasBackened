const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');
// Create subscription
router.post('/', protect,subscriptionController.createSubscription);

// Skip today's subscription delivery
router.post('/:subscriptionId/skip', protect,subscriptionController.skipToday);

module.exports = router;
