const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');


exports.createSubscription = async (req, res) => {
  const { user, subscriptionType } = req.body;

  try {
    const startDate = new Date();
    let endDate = new Date(startDate);
    let renewalDate = new Date(startDate);

    switch (subscriptionType) {
      case 'Daily':
        endDate.setDate(endDate.getDate() + 1);
        renewalDate.setDate(renewalDate.getDate() + 1);
        break;
      case 'Weekly':
        endDate.setDate(endDate.getDate() + 7);
        renewalDate.setDate(renewalDate.getDate() + 7);
        break;
      case 'Monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        break;
      default:
        return res.status(400).json({ message: 'Invalid subscription type' });
    }

    const sub = await Subscription.create({
      user,
      subscriptionType,
      startDate,
      endDate,
      renewalDate,
    });

    res.status(201).json(sub);
  } catch (err) {
    console.error(err);
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

