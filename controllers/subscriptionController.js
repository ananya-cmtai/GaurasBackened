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
    const renewalDate = new Date(endDate); // You can customize this logic later

   if (subscriptionType === 'Weekly') {
  if (!deliveryDays) {
    return res.status(400).json({ message: 'deliveryDays is required for weekly subscription' });
  }

  const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (!validDays.includes(deliveryDays)) {
    return res.status(400).json({ message: 'Invalid deliveryDays value' });
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
      deliveryDays: subscriptionType === 'Weekly' ? deliveryDays : undefined,
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

    // Prevent duplicate skips
    if (subscription.skippedDates.some(date => date.getTime() === todayWithoutTime.getTime())) {
      return res.status(400).json({ message: 'Today is already skipped' });
    }

    subscription.skippedDates.push(todayWithoutTime);
    subscription.endDate = new Date(subscription.endDate.getTime() + 24 * 60 * 60 * 1000);
    await subscription.save();

    // Optional Notification
    await Notification.create({
      user: subscription.user,
      type: 'subscription_extended',
      message: 'Your subscription was extended by 1 day due to skipping today.',
    });

    res.json({ message: 'Subscription extended and notification sent', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error skipping delivery', error: error.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;
  

    const subs = await Subscription.find({ user: userId })   .populate({
        path: 'productId',
        model: 'Product'  // Make sure 'Product' is the correct model name
      });
    res.json({ subscriptions: subs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscriptions', error: error.message });
  }
};

exports.setSkippedDates = async (req, res) => {
  const { subscriptionId } = req.params;
  const { skippedDates } = req.body;

  try {
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Store new skipped dates
    subscription.skippedDates = skippedDates.map(date => new Date(date));
    await subscription.save();

    res.status(200).json({
      message: 'Skipped dates updated successfully',
      skippedDates: subscription.skippedDates,
    });
  } catch (error) {
    console.error('Error updating skipped dates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
