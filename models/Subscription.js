const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  startDate: Date,
  endDate: Date,
  daysRemaining: Number,
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
