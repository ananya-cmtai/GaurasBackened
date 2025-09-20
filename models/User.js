const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Optional: if using for auth

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  source: { type: String }, // e.g., 'Top-up', 'Order Payment'
  date: { type: Date, default: Date.now },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, 
   paymentDetails: {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
       razorpay_signature: { type: String },
  },  paymentMode:{
    type:String,
        enum: ['Wallet', 'Razorpay'],
  },
  // Optionally, keep track of payment verification status
  paymentVerified: {
    type: Boolean,
    default: false,
  },
});

// Wallet Schema
const walletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  transactions: [transactionSchema],
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    // required: true,
    unique: true,
  },
  address: {
    type: String,
    // required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  wallet: walletSchema, // Clean integration
  role: {
    type: String,
    default: 'user', // or 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
