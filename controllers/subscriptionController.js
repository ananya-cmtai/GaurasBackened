const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

exports.createSubscription = async (req, res) => {
  const { user, subscriptionType, startDate, endDate, renewalDate } = req.body;

  try {
    const sub = await Subscription.create({
      user,
      subscriptionType,
      startDate,
      endDate,
      renewalDate,
    });

    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subscription' });
  }
};


exports.skipToday = async (req, res) => {
  const { subscriptionId } = req.params;

  try {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Extend endDate by 1 day
    subscription.endDate = new Date(subscription.endDate.getTime() + 24 * 60 * 60 * 1000);
    await subscription.save();

    // Notify user
    await Notification.create({
      user: subscription.user,
      type: 'subscription_extended',
      message: 'Your subscription was extended by 1 day due to skip today.',
    });

    res.json({ message: 'Subscription extended and notification sent', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error skipping delivery', error: error.message });
  }
};

