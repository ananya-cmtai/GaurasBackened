const { sendNotification } = require('../config/notificationUtils');  // adjust path accordingly
const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');

// Example controller function to notify user about subscription expiry
const notifyUserAboutExpiry = async (userId, expiryDate) => {
  try {
    // Pehle notification DB me create karo
    await Notification.create({
      user: userId,
      type: 'subscription_expiry',
      message: `Your subscription will expire on ${expiryDate.toDateString()}. Please renew soon!`,
    });

    // Fir OneSignal se push notification bhejo
    await sendNotification(
      userId,
      `Your subscription will expire on ${expiryDate.toDateString()}. Please renew soon!`,
      'Subscription Expiry Reminder'
    );

    console.log('Notification sent to user:', userId);
  } catch (error) {
    console.error('Error notifying user:', error);
  }
};

module.exports = { notifyUserAboutExpiry };
