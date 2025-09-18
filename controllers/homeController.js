const Home = require('../models/Home');

// 🔍 Get Home Data
exports.getHome = async (req, res) => {
  try {
    const home = await Home.findOne({}).populate('featuredSections.products');
    res.json(home);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// 🆕 Create or Update Full Home Page
exports.createOrUpdateHome = async (req, res) => {
  try {
    const data = req.body;
    let home = await Home.findOne();

    if (home) {
      home.banners = data.banners || home.banners;
      home.featuredSections = data.featuredSections || home.featuredSections;
    } else {
      home = new Home(data);
    }

    await home.save();
    res.json({ message: 'Home data saved successfully', home });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save home data' });
  }
};

// ➕ Add a Banner
exports.addBanner = async (req, res) => {
  try {
    const { title, description } = req.body;
    const home = await Home.findOne();

    if (!home) return res.status(404).json({ error: 'Home data not found' });

    home.banners.push({ title, description, imageUrl: req.file ? req.file.path : null, });
    await home.save();

    res.json({ message: 'Banner added', banners: home.banners });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add banner' });
  }
};

// ✏️ Update a Banner by ID
exports.updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const { title, description,imageUrl } = req.body;

    const home = await Home.findOne();
    if (!home) return res.status(404).json({ error: 'Home data not found' });

    const banner = home.banners.id(bannerId);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    if (title) banner.title = title;
    if (description) banner.description = description;
      if (imageUrl) banner.imageUrl = req.file ? req.file.path : null;

    await home.save();
    res.json({ message: 'Banner updated', banner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

// ❌ Delete a Banner by ID
exports.deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const home = await Home.findOne();
    if (!home) return res.status(404).json({ error: 'Home data not found' });

    const banner = home.banners.id(bannerId);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    banner.remove();
    await home.save();

    res.json({ message: 'Banner deleted', banners: home.banners });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};
