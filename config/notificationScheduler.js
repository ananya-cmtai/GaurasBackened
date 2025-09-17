const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const User = require('../models/User');


const scheduleNotificationJob = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);

      const expiringSubs = await Subscription.find({
        endDate: {
          $gte: today,
          $lte: threeDaysLater,
        },
        status: 'Active',
      }).populate('user');

      for (const sub of expiringSubs) {
        await Notification.create({
          user: sub.user._id,
          type: 'subscription_expiry',
          message: `Your subscription will expire on ${sub.endDate.toDateString()}. Please renew soon!`,
        });
      }

      console.log('Notification job completed');
    } catch (error) {
      console.error('Error running notification job:', error);
    }
  });
};

module.exports = scheduleNotificationJob;  

