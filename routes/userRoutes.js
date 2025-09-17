const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const walletController = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
// Register user
router.post('/register', userController.register);

// Login user
router.post('/login', userController.login);

// Get user wallet
router.get('/:userId/wallet',protect, walletController.getWallet);

// Add funds to wallet
router.post('/:userId/wallet/add',protect, walletController.addFunds);

module.exports = router;
