const express = require('express');
const router = express.Router();
const {
  addFunds,
  getWallet,
  deductFromWallet,
} = require('../controllers/walletController');

const { protect } = require('../middleware/auth');

// ✅ Add money to wallet (Top-up)
router.post('/topup', protect, addFunds);

// ✅ Deduct money for an order
router.post('/deduct', protect, deductFromWallet);

// ✅ Get wallet balance and transaction history
router.get('/', protect, getWallet);

module.exports = router;
