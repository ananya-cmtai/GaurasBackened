const Subscription = require('../models/Subscription');
const User = require('../models/User');

const Notification = require('../models/Notification');


exports.getUserNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get notifications', error: error.message });
  }
};
