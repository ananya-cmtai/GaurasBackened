const express = require('express');
const router = express.Router();
const {
  topUpWallet,
  getWalletTransactions
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
router.post('/topup',protect, topUpWallet);
router.get('/transactions/:userId',protect, getWalletTransactions);

module.exports = router;
