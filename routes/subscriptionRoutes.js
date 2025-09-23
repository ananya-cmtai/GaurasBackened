const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// 🔐 Protect all routes using 'protect' middleware
router.get('/', protect, subscriptionController.getSubscriptions);

router.get('/getById/:id', protect, subscriptionController.getSubscriptionById);
// Create a new subscription
router.post('/', protect, subscriptionController.createSubscription);

// Get all subscriptions for logged-in user

// Skip today's delivery (adds today to skippedDates)
router.post('/:subscriptionId/skip', protect, subscriptionController.skipToday);

// Update skippedDates manually (from calendar UI)
router.post('/:subscriptionId/skip-dates', protect, subscriptionController.setSkippedDates);

router.get('/subscription-today', protect, subscriptionController.getTodaySubscriptions);

module.exports = router;
