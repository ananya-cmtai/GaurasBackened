const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const moment = require('moment');
exports.createSubscription = async (req, res) => {
  const { subscriptionType, productId, startDate: startDateString, address, numberPacket, total, deliveryDays , razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
  paymentMode,
      paymentVerified,
       deliveryFee,
      gst,
      discount,} = req.body;
        if(paymentMode==="Razorpay"){
 if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required Razorpay details." });
    }
    const generated_signature = crypto.createHmac('sha256', "2kA1raBV7KriMGR8EHoQAXY0")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }}
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
       paymentMode,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
  
      paymentVerified,
       deliveryFee,
      gst,
      discount,
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

    const subscriptions = await Subscription.find({ user: userId }).populate({
      path: 'productId',
      model: 'Product',
    });
 const sortedsubscriptions = subscriptions.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const today = new Date();

    const updatedSubscriptions = await Promise.all(
      sortedsubscriptions.map(async (sub) => {
        if (sub.status === 'Active' && sub.renewalDate < today) {
          sub.status = 'Expired';
          await sub.save(); // Update in DB
        }
        return sub;
      })
    );

    res.json({ subscriptions: updatedSubscriptions });
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

    const startDate = new Date(subscription.startDate);
    
    // Original end date before skips (fixed 30 days from start)
    const originalEndDate = new Date(startDate);
    originalEndDate.setDate(originalEndDate.getDate() + 30);

    // Validate skippedDates are within [startDate, originalEndDate]
    const validSkippedDates = skippedDates
      .map(date => new Date(date))
      .filter(date =>
        date >= startDate &&
        date <= originalEndDate
      );

    if (validSkippedDates.length !== skippedDates.length) {
      return res.status(400).json({
        message: 'Some skipped dates are outside the valid subscription period',
      });
    }

 const existingSkippedDates = subscription.skippedDates || [];

// Combine existing + new dates
const allDates = [...existingSkippedDates, ...validSkippedDates];

// Remove duplicates using string date
const uniqueSkippedDates = Array.from(new Set(
  allDates.map(date => new Date(date).toISOString().split('T')[0])
)).map(dateStr => new Date(dateStr));

// Save
subscription.skippedDates = uniqueSkippedDates;


    if (subscription.subscriptionType === 'Daily') {
   const extensionDays = uniqueSkippedDates.length;


      // Extend endDate and renewalDate
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + 30 + extensionDays);

      subscription.endDate = newEndDate;
      subscription.renewalDate = newEndDate;
    }
  if (subscription.subscriptionType === 'Alternate') {
  const extensionDays = uniqueSkippedDates.length * 2;

  const newEndDate = new Date(startDate);
  newEndDate.setDate(newEndDate.getDate() + 30 + extensionDays);

  subscription.endDate = newEndDate;
  subscription.renewalDate = newEndDate;
}

if (subscription.subscriptionType === 'Weekly') {
  const extensionDays = uniqueSkippedDates.length * 7;

      // Extend endDate and renewalDate
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + 30 + extensionDays);

      subscription.endDate = newEndDate;
      subscription.renewalDate = newEndDate;
    }

    await subscription.save();

    res.status(200).json({
      message: 'Skipped dates updated successfully',
      skippedDates: subscription.skippedDates,
      endDate: subscription.endDate,
      renewalDate: subscription.renewalDate,
    });
  } catch (error) {
    console.error('Error updating skipped dates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




exports.getTodaySubscriptions = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id;
    const today = moment().startOf('day').toDate();
    const todayName = moment().format('dddd');

    // Fetch Daily and Weekly subscriptions directly from DB
    const dailyAndWeeklySubs = await Subscription.find({
      deliveryBoy: deliveryBoyId,
      status: 'Active',
      startDate: { $lte: today },
      endDate: { $gte: today },
      skippedDates: { $ne: today },
      $or: [
        { subscriptionType: 'Daily' },
        { subscriptionType: 'Weekly', deliveryDays: todayName },
      ],
    }).populate('user').populate('productId');

    // Fetch all Alternate subscriptions active today
    const alternateSubs = await Subscription.find({
      deliveryBoy: deliveryBoyId,
      status: 'Active',
      subscriptionType: 'Alternate',
      startDate: { $lte: today },
      endDate: { $gte: today },
      skippedDates: { $ne: today },
    }).populate('user').populate('productId');

    // Filter alternate subscriptions to only those where days difference from startDate is even
    const filteredAlternateSubs = alternateSubs.filter((sub) => {
      const start = moment(sub.startDate).startOf('day');
      const diffDays = moment(today).diff(start, 'days');
      return diffDays % 2 === 0;
    });

    const allSubscriptions = [...dailyAndWeeklySubs, ...filteredAlternateSubs];

    res.status(200).json({ data: allSubscriptions });
  } catch (error) {
    console.error('Error fetching today’s subscriptions:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};


exports.getSubscriptionById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Getting subscription for ID:", id);

    const subscription = await Subscription.findById(id)
      .populate('productId')
      .populate('user');

    if (!subscription) {
      console.warn("Subscription not found for ID:", id);
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({ data: subscription });
  } catch (err) {
    console.error("Error fetching subscription:", err);
    res.status(500).json({ message: 'Could not fetch subscription', error: err.message });
  }
};

