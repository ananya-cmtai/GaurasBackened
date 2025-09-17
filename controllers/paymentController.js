const Payment = require('../models/payment');

exports.recordPayment = async (req, res) => {
  const { order, paymentMethod, paymentStatus, transactionId, amount } = req.body;

  try {
    const payment = await Payment.create({
      order,
      paymentMethod,
      paymentStatus,
      transactionId,
      amount,
    });

    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to record payment' });
  }
};
