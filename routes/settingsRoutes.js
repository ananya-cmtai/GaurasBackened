const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const uploadLoginImages=require("../middleware/uploadLoginImages");
// GET settings
router.get('/', settingsController.getSettings);

// POST create or update settings
router.post('/', settingsController.createOrUpdateSettings);

router.post('/banner', uploadLoginImages.single('loginImageUrls'), settingsController.addBanner);

// PUT update a banner at a given index
router.put('/banner/:index', uploadLoginImages.single('loginImageUrls'), settingsController.updateBanner);

// DELETE remove a banner at a given index
router.delete('/banner/:index', settingsController.deleteBanner);

module.exports = router;
