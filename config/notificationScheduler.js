const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const { notifyUserAboutExpiry } = require('../controllers/notificationController');  // adjust path

const scheduleNotificationJob = () => {
  cron.schedule('0 8 * * *', async () => {  // har din subah 8 baje chalega
    try {
      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);

      // Jo subscriptions 3 din ke andar expire ho rahi hain
      const expiringSubs = await Subscription.find({
        endDate: { $gte: today, $lte: threeDaysLater },
        status: 'Active',
      }).populate('user');

      for (const sub of expiringSubs) {
        // Notification bhejne ka function call karo
        await notifyUserAboutExpiry(sub.user._id, sub.endDate);
      }

      console.log('Scheduled notification job completed successfully.');
    } catch (error) {
      console.error('Error running scheduled notification job:', error);
    }
  });
};

module.exports = scheduleNotificationJob;
