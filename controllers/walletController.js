const User = require('../models/User');

exports.addFunds = async (req, res) => {
  const { userId, amount, description } = req.body;

  try {
    const user = await User.findById(userId);
    user.wallet.balance += amount;
    user.wallet.transactions.push({
      type: 'Credit',
      amount,
      description: description || 'Wallet Top-up',
    });
    await user.save();

    res.status(200).json({ message: 'Funds added', balance: user.wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Wallet error', error: err.message });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.status(200).json(user.wallet);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wallet', error: err.message });
  }
};
