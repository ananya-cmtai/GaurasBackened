const mongoose = require('mongoose');

const NormalOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: { type: String, enum: ['placed', 'delivered', 'cancelled'], default: 'placed' },
  deliveryDate: Date
}, { timestamps: true });

module.exports = mongoose.model('NormalOrder', NormalOrderSchema);
