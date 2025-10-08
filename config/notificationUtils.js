const admin = require('firebase-admin');
const User = require('../models/User'); // Import User model

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-service-account.json'); // tumhara Firebase service account JSON
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send notification to a user via FCM
 * @param {string} userId - User ID from DB
 * @param {string} type - Type of notification (for client-side handling)
 * @param {string} message - Notification body
 * @param {string} title - Notification title (default 'New Notification')
 */
const sendNotification = async (userId, type, message, title = 'New Notification') => {
  try {
    // Find user to get FCM token
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.fcmToken) throw new Error('FCM token is missing for user');

    // Prepare notification payload
    const payload = {
      token: user.fcmToken,
      notification: {
        title,
        body: message,
      },
      data: { type }, // extra data for client
    };

    // Send via FCM
    const response = await admin.messaging().send(payload);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send notification:', error.message);
    throw error;
  }
};

module.exports = { sendNotification };
