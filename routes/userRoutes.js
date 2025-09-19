const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const walletController = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
// Register user
router.post('/send-otp', userController.sendOtp);

// Login user
router.post('/verify-otp', userController.verifyOtp);

// Get user wallet
router.get('/:userId/wallet',protect, walletController.getWallet);

// Add funds to wallet
router.post('/:userId/wallet/add',protect, walletController.addFunds);

router.put('/profile', protect, userController.updateProfile);

router.get('/profile', protect, userController.getProfile);  

module.exports = router;
