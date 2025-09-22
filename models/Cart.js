import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming products are stored in a Product model
    ref: 'Product',
    required: true,
  },
  name: String,
  price: Number,
  imageUrl: String,
  description: String,
  quantity: String,
  quantityPackets: Number,
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user has one cart
  },
  items: [cartItemSchema],
}, {
  timestamps: true,
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
