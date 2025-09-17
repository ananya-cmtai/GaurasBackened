const NormalOrder = require('../models/NormalOrders');
const Product = require('../models/Product');
const { deductFromWallet } = require('./walletController');

exports.placeOrder = async (req, res) => {
  try {
    const { userId, items, deliveryDate } = req.body;

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) return res.status(400).json({ message: 'Invalid product in cart' });
      totalAmount += product.pricePerUnit * item.quantity;
    }

    // Deduct from wallet
    try {
      await deductFromWallet(userId, totalAmount, 'Order payment');
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Create order
    const order = new NormalOrder({
      userId,
      items,
      totalAmount,
      status: 'placed',
      deliveryDate
    });

    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error placing order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await NormalOrder.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};
