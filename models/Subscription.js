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
    enum: ['Alternate', 'Daily', 'Weekly'],
    required: true,
  },
  deliveryDays: [{
  type: String,
  enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
}],

  productId:{
  type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  address:{
type: String,
  
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
  numberPacket:{
    type: Number,
    default:1,
    required: true
  },
   skippedDates: [{ type: Date }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  total:{
    type: Number,
    required:true
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
