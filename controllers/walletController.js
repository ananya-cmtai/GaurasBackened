const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');

exports.topUpWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance += amount;
    await user.save();

    const transaction = new WalletTransaction({
      userId,
      type: 'credit',
      amount,
      description: 'Wallet top-up'
    });
    await transaction.save();

    res.status(200).json({ message: 'Wallet topped up', walletBalance: user.walletBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error topping up wallet' });
  }
};

exports.deductFromWallet = async (userId, amount, description) => {
  // Internal function, not route
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.walletBalance < amount) throw new Error('Insufficient wallet balance');

  user.walletBalance -= amount;
  await user.save();

  const transaction = new WalletTransaction({
    userId,
    type: 'debit',
    amount,
    description
  });
  await transaction.save();

  return user.walletBalance;
};

exports.getWalletTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await WalletTransaction.find({ userId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};
