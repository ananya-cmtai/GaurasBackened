const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
// Get all products
router.get('/',protect, productController.getAllProducts);

// Add new product (admin)
router.post('/',protect, productController.addProduct);

module.exports = router;
