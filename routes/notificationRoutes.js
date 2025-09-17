const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead
} = require('../controllers/notificationController');

router.get('/:userId', getUserNotifications);
router.put('/read/:notificationId', markAsRead);

module.exports = router;
