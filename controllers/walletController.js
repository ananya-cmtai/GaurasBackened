const User = require('../models/User');

exports.addFunds = async (req, res) => {
  const { amount, description,razorpay_order_id,razorpay_signature,razorpay_payment_id } = req.body;
  const userId = req.user._id; 
 if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required Razorpay details." });
    }

    // Verify Razorpay payment signature
    const generated_signature = crypto.createHmac('sha256', "2kA1raBV7KriMGR8EHoQAXY0")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wallet.balance += amount;
    user.wallet.transactions.push({
      type: 'Credit',
      amount,
      description: description || 'Wallet Top-up',
      source: 'Top-up',
       paymentDetails: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      },
      paymentVerified: true,
    });

    await user.save();

    res.status(200).json({
      message: 'Funds added',
      balance: user.wallet.balance,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Wallet error',
      error: err.message,
    });
  }
};

exports.getWallet = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.wallet);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching wallet',
      error: err.message,
    });
  }
};

exports.deductFromWallet = async (req, res) => {
  const { amount, description, orderId } = req.body;
  const userId = req.user._id; // secure

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    user.wallet.balance -= amount;
    user.wallet.transactions.push({
      type: 'Debit',
      amount,
      description: description || 'Payment for order',
      source: 'Order Payment',
      orderId,
    });

    await user.save();

    res.status(200).json({
      message: 'Amount deducted',
      balance: user.wallet.balance,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error during debit',
      error: err.message,
    });
  }
};

