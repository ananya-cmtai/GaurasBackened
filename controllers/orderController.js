
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/OrderModel');

exports.placeOrder = async (req, res) => {
  const { userId, products, totalAmount, deliveryAddress } = req.body;

  try {
    const order = await Order.create({
      user: userId,
      products,
      totalAmount,
      deliveryAddress,
    
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


exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // वैलिड स्टेटस चेक करें
    const validStatuses = ['Pending', 'Completed', 'Cancelled', 'Shipped'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // ऑर्डर अपडेट करें
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
