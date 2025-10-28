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

// Add a banner
exports.addBanner = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ error: 'Settings not found' });

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Since loginImageUrls is an array of strings
    settings.loginImageUrls.push(req.file.path);
    await settings.save();

    res.json({ message: 'Banner added', loginImageUrls: settings.loginImageUrls });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add banner' });
  }
};

// Update a banner by index
exports.updateBanner = async (req, res) => {
  try {
    const { index } = req.params; // pass index of banner to update
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ error: 'Settings not found' });

    if (!settings.loginImageUrls[index]) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    settings.loginImageUrls[index] = req.file.path;
    await settings.save();

    res.json({ message: 'Banner updated', loginImageUrls: settings.loginImageUrls });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

// Delete a banner by index
exports.deleteBanner = async (req, res) => {
  try {
    const { index } = req.params; // pass index of banner to delete
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ error: 'Settings not found' });

    if (!settings.loginImageUrls[index]) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    settings.loginImageUrls.splice(index, 1);
    await settings.save();

    res.json({ message: 'Banner deleted', loginImageUrls: settings.loginImageUrls });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};
