const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET settings
router.get('/', settingsController.getSettings);

// POST create or update settings
router.post('/', settingsController.createOrUpdateSettings);


module.exports = router;
