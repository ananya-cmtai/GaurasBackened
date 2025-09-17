const Subscription = require('../models/Subscription');
const DeliveryCalendar = require('../models/DeliveryCalendar');
const Product = require('../models/Product');

// Helper to generate delivery calendar
const generateCalendar = (subscriptionId, startDate, days) => {
  const calendar = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    calendar.push({ subscriptionId, date, status: 'scheduled' });
  }
  return calendar;
};

exports.startSubscription = async (req, res) => {
  try {
    const { userId, productId, quantity, days } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(400).json({ message: 'Invalid product' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days - 1);

    const subscription = new Subscription({
      userId,
      productId,
      quantity,
      startDate,
      endDate,
      daysRemaining: days,
      status: 'active'
    });

    await subscription.save();

    const calendarEntries = generateCalendar(subscription._id, startDate, days);
    await DeliveryCalendar.insertMany(calendarEntries);

    res.status(201).json({ message: 'Subscription started', subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.skipDelivery = async (req, res) => {
  try {
    const { subscriptionId, date } = req.body;
    const parsedDate = new Date(date);

    const calendarEntry = await DeliveryCalendar.findOne({
      subscriptionId,
      date: parsedDate,
      status: 'scheduled'
    });

    if (!calendarEntry) {
      return res.status(404).json({ message: 'Delivery not found or already skipped/delivered' });
    }

    calendarEntry.status = 'skipped';
    await calendarEntry.save();

    // Extend subscription by 1 day
    const subscription = await Subscription.findById(subscriptionId);
    subscription.daysRemaining += 1;
    subscription.endDate.setDate(subscription.endDate.getDate() + 1);
    await subscription.save();

    // Add new calendar entry for extended day
    const newDate = new Date(subscription.endDate);
    const newCalendarEntry = new DeliveryCalendar({
      subscriptionId,
      date: newDate,
      status: 'scheduled'
    });
    await newCalendarEntry.save();

    res.status(200).json({ message: 'Delivery skipped and subscription extended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error skipping delivery' });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const calendar = await DeliveryCalendar.find({ subscriptionId }).sort({ date: 1 });
    res.status(200).json(calendar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch calendar' });
  }
};
