const Favourite = require('../models/Favourite');

// GET favourite items for the logged-in user
exports.getFavourite = async (req, res) => {
  try {
    const favourite = await Favourite.findOne({ user: req.user._id });

    if (!favourite) {
      return res.status(200).json({ items: [] }); // Return empty if no favourites
    }

    res.status(200).json({ items: favourite.items });
  } catch (err) {
    console.error('Favourite fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch favourite' });
  }
};

// SAVE/UPDATE favourite items for the logged-in user
exports.saveFavourite = async (req, res) => {
  try {
    const { items } = req.body;

    await Favourite.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items } },
      { new: true, upsert: true } // create if not found
    );

    res.status(200).json({ message: 'Favourite saved successfully' });
  } catch (err) {
    console.error('Favourite save error:', err);
    res.status(500).json({ message: 'Failed to save favourite' });
  }
};
