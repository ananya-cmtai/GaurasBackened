const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');


router.get('/get', protect, cartController.getCart);
router.post('/save', protect, cartController.saveCart);


module.exports = router;