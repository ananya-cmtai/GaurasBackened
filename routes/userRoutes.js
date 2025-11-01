const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const walletController = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
// Register user
router.get('/profile', protect, userController.getProfile);  
router.get('/', protect, userController.getAllUser);  
router.get('/:userId/wallet',protect, walletController.getWallet);
router.post('/send-otp', userController.sendOtp);

// Login user
router.post('/verify-otp', userController.verifyOtp);
router.post('/save-fcm-token',userController.saveFCMtoken);
// Get user wallet


// Add funds to wallet
router.post('/:userId/wallet/add',protect, walletController.addFunds);

router.put('/profile', protect, userController.updateProfile);



module.exports = router;
