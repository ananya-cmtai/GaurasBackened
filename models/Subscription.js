// models/subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscriptionType: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Daily'],
    required: true,
  },
  productId:{
  type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Cancelled'],
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
