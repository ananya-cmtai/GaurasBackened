const mongoose = require('mongoose');

const DeliveryCalendarSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  date: Date,
  status: { type: String, enum: ['scheduled', 'skipped', 'delivered'], default: 'scheduled' }
});

module.exports = mongoose.model('DeliveryCalendar', DeliveryCalendarSchema);
