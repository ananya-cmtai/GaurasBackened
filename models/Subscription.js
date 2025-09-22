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
  deliveryDays: {
  type: String,
  enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
},

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
    enum: ['Active', 'Expired', 'Cancelled'],
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
  }, paymentDetails: {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
       razorpay_signature: { type: String },
  },
    paymentMode:{
    type:String,
        enum: ['Wallet', 'Razorpay'],
  },
  // Optionally, keep track of payment verification status
  paymentVerified: {
    type: Boolean,
    default: false,
  },
    deliveryFee: {
    type: Number,
 
  },
  gst: {
    type: Number,
 
  },
  discount: {
    type: Number,
    default: 0,
  },
  deliveryBoy:{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
