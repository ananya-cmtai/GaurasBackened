const express = require('express');
const { sendNotification } = require('../config/notificationUtils');  // Import the sendNotification function

const router = express.Router();

// Route to send notification
router.post('/send-notification', async (req, res) => {
  const { userId, type, message, title } = req.body;

  // Validate the request data
  if (!userId || !type || !message) {
    return res.status(400).json({ message: 'userId, type, and message are required' });
  }

  try {
    // Send the notification
    const response = await sendNotification(userId, type, message, title);
    res.status(200).json({ message: 'Notification sent successfully!', response });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
});

module.exports = router;
