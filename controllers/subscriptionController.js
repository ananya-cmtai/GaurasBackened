const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

exports.createSubscription = async (req, res) => {
  const { subscriptionType, productId, startDate: startDateString, address, numberPacket, total, deliveryDays } = req.body;

  try {
    const user = req.user._id;

    if (!startDateString || !address) {
      return res.status(400).json({ message: 'Start date and address are required' });
    }

    const startDate = new Date(startDateString);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ message: 'Invalid start date format' });
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30); // Fixed 30 days duration
    const renewalDate = new Date(endDate); // You can update this logic if renewal happens earlier

    // Weekly type requires deliveryDays
    if (subscriptionType === 'Weekly') {
      if (!Array.isArray(deliveryDays) || deliveryDays.length === 0) {
        return res.status(400).json({ message: 'deliveryDays is required for weekly subscription' });
      }

      // Optional: validate deliveryDays values
      const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const isValid = deliveryDays.every(day => validDays.includes(day));
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid deliveryDays values' });
      }
    }

    const sub = await Subscription.create({
      user,
      subscriptionType,
      startDate,
      endDate,
      renewalDate,
      productId,
      address,
      total,
      numberPacket,
      deliveryDays: subscriptionType === 'Weekly' ? deliveryDays : undefined
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

    const today = new Date();
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Check if today is already skipped
    if (subscription.skippedDates.some(date => date.getTime() === todayWithoutTime.getTime())) {
      return res.status(400).json({ message: 'Today is already skipped' });
    }

    // Add today's date to skippedDates
    subscription.skippedDates.push(todayWithoutTime);

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


