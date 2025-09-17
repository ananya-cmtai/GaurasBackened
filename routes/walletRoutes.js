const express = require('express');
const router = express.Router();
const {
  topUpWallet,
  getWalletTransactions
} = require('../controllers/walletController');

router.post('/topup', topUpWallet);
router.get('/transactions/:userId', getWalletTransactions);

module.exports = router;
