const Settings = require('../models/Settings');

// Get current settings (assuming only one settings document)
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update settings (if exists update else create new)
exports.createOrUpdateSettings = async (req, res) => {
  try {
    const { gst, deliveryCharge, extraCharge, coupons } = req.body;

    let settings = await Settings.findOne();

    if (settings) {
      // update existing
      settings.gst = gst ?? settings.gst;
      settings.deliveryCharge = deliveryCharge ?? settings.deliveryCharge;
      settings.extraCharge = extraCharge ?? settings.extraCharge;
      settings.coupons = coupons ?? settings.coupons;
    } else {
      // create new
      settings = new Settings({ gst, deliveryCharge, extraCharge, coupons });
    }

    const savedSettings = await settings.save();
    res.json(savedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
