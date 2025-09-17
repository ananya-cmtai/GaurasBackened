
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/OrderModel');

exports.placeOrder = async (req, res) => {
  const { userId, products, totalAmount, deliveryAddress, deliveryDate } = req.body;

  try {
    const order = await Order.create({
      user: userId,
      products,
      totalAmount,
      deliveryAddress,
      deliveryDate,
    });

    res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ user: userId }).populate('products.productId');

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch orders', error: err.message });
  }
};

