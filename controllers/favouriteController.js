// Get favourite for logged-in user
const Favourite = require('../models/Favourite');

exports.getFavourite = async (req, res) => {
  try {
    const favourite = await Favourite.findOne({ user: req.user._id });
    if (!favourite) return res.status(200).json({ items: [] }); // empty favourite

    res.status(200).json({ items: favourite.items });
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch favourite' });
  }
};
// Save/update favourite for logged-in user
exports.saveFavourite = async (req, res) => {
  try {
    const { items } = req.body;

    let favourite = await Favourite.findOne({ user: req.user._id });

    if (!favourite) {
      favourite = new Favourite({
        user: req.user._id,
        items,
      });
    } else {
      favourite.items = items;
    }

    await favourite.save();
    res.status(200).json({ message: 'favourite saved successfully' });
  } catch (err) {
    console.error('favourite save error:', err);
    res.status(500).json({ message: 'Failed to save favourite' });
  }
};
