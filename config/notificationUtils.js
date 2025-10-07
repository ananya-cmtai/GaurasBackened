const axios = require('axios');
const User = require('../models/User');  // Import User model

// OneSignal App ID and REST API Key — environment variables se lena zyada secure hota hai
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || 'your-onesignal-app-id';
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY || 'your-onesignal-api-key';

// Function to send notification
const sendNotification = async (userId, type, message, title = 'New Notification') => {
  try {
    // Find user by ID to get OneSignal Player ID
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.oneSignalPlayerId) {
      throw new Error('OneSignal Player ID is missing for user');
    }

    // Prepare notification payload
    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [user.oneSignalPlayerId],
      contents: { en: message },
      headings: { en: title },
      data: { type },  // shorthand for type: type
    };

    // Send POST request to OneSignal API
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      notificationData,
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send notification:', error.message);
    throw error;
  }
};

module.exports = { sendNotification };
