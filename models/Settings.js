const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // coupon codes unique hone chahiye
  },
  discountTitle: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
});

const settingsSchema = new mongoose.Schema({
  gst: {
    type: Number,
    required: true,
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    required: true,
    default: 0,
  },
  extraCharge: {
    type: Number,
    required: true,
    default: 0,
  },
  coupons: [couponSchema], // coupons ka array
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
