// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      productName:{
        type:String,
        required:true
      },
      quantityPacket: {
        type: Number,
        required: true,
      },
      quantity:{
          type: String,
        required: true,
      }
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Delivered', 'Cancelled', 'Shipped'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentMode:{
    type:String,
        enum: ['Wallet', 'Razorpay'],
  },
  paymentDetails: {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
       razorpay_signature: { type: String },
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
   refundStatus: { type: String, default: 'Not Initiated' },  // 'Not Initiated', 'Processing', 'Refunded', 'Failed'
  refundMessage: { type: String, default: '' }, 
  deliveryBoy:{
   type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  }
});

module.exports = mongoose.model('Order', orderSchema);
