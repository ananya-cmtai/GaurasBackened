const express = require('express');
const router = express.Router();
const {
  startSubscription,
  skipDelivery,
  getCalendar
} = require('../controllers/subscriptionController');

router.post('/start', startSubscription);
router.post('/skip', skipDelivery);
router.get('/calendar/:subscriptionId', getCalendar);

module.exports = router;
