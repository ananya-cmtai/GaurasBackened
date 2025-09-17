const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const notificationController = require('../controllers/notificationController');

router.get('/:userId', protect, notificationController.getUserNotifications);

module.exports = router;
