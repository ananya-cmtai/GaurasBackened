// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

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
    required: true,
    unique: true,
  },

  address: {
    type: String,
    // required: true,
  },
isEmailVerified:{
  type:Boolean ,default:false
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



module.exports = mongoose.model('User', userSchema);
