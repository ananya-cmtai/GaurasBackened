const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const uploadHome=require("../middleware/uploadBanners");
const { protect } = require('../middleware/auth');
// 🔍 Get full home page
router.get('/',protect, homeController.getHome);

// 🆕 Create or update home data
router.post('/',protect, homeController.createOrUpdateHome);

// ➕ Add a new banner
router.post('/banner',protect, uploadHome.single('imageUrl'), homeController.addBanner);

// ✏️ Update banner by ID
router.put('/banner/:bannerId',protect, uploadHome.single('imageUrl'),  homeController.updateBanner);

// ❌ Delete banner by ID
router.delete('/banner/:bannerId',protect, homeController.deleteBanner);

module.exports = router;
