const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  walletBalance: { type: Number, default: 0 },
  isVIP: { type: Boolean, default: false },
  subscription: {
    status: { type: String, default: 'inactive' },
    expiresAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
