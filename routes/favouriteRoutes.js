const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const { protect } = require('../middleware/auth');


router.get('/get', protect, favouriteController.getFavourite);
router.post('/save', protect, favouriteController.saveFavourite);


module.exports = router;