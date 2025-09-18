const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const uploadProducts =require("../middleware/uploadProducts");
// Get all products
router.get('/',protect, productController.getAllProducts);

// Add new product (admin)
router.post('/',protect,  uploadProducts.single('imageUrl'), productController.addProduct);

module.exports = router;
