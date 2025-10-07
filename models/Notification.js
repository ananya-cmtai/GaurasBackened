const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to User model
    required: true,  // Ensures the notification is always associated with a user
  },
  type: {
    type: String,
    enum: ['subscription_expiry', 'subscription_extended', 'payment_failed', 'order_update'],  // Specific types of notifications
    required: true,  // Ensures the notification type is specified
  },
  message: {
    type: String,
    required: true,  // Ensures a message is provided for the notification
  },
  isRead: {
    type: Boolean,
    default: false,  // Default value is false, meaning unread
  },
  createdAt: {
    type: Date,
    default: Date.now,  // Sets the current timestamp by default
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
