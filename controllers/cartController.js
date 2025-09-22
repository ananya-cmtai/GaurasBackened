// Get cart for logged-in user
const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(200).json({ items: [] }); // empty cart

    res.status(200).json({ items: cart.items });
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};
// Save/update cart for logged-in user
exports.saveCart = async (req, res) => {
  try {
    const { items } = req.body;

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items } },
      { new: true, upsert: true } 
    );

    res.status(200).json({ message: 'Cart saved successfully' });
  } catch (err) {
    console.error('Cart save error:', err);
    res.status(500).json({ message: 'Failed to save cart' });
  }
};
