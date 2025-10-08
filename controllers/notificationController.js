const { sendNotification } = require('../config/notificationUtils');  // Firebase version
const Notification = require('../models/Notification');

// Example controller function to notify user about subscription expiry
const notifyUserAboutExpiry = async (userId, expiryDate) => {
  try {
    // Pehle notification DB me create karo
    await Notification.create({
      user: userId,
      type: 'subscription_expiry',
      message: `Your subscription will expire on ${expiryDate.toDateString()}. Please renew soon!`,
    });

    // Fir Firebase FCM se push notification bhejo
    await sendNotification(
      userId,
      'subscription_expiry', // type for client-side handling
      `Your subscription will expire on ${expiryDate.toDateString()}. Please renew soon!`,
      'Subscription Expiry Reminder'
    );

    console.log('Notification sent to user:', userId);
  } catch (error) {
    console.error('Error notifying user:', error.message);
  }
};

module.exports = { notifyUserAboutExpiry };
