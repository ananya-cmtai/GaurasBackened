// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  address: {
    type: String,
    required: true,
  },

  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },

  wallet: {
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        type: {
          type: String,
          enum: ['Credit', 'Debit'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  role: {
    type: String,
    default: 'user', // Could also be 'admin'
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password hashing before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);
