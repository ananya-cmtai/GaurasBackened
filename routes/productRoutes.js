const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const uploadProducts =require("../middleware/uploadProducts");

router.get('/',protect, productController.getAllProducts);


router.post('/',protect,  uploadProducts.single('imageUrl'), productController.addProduct);


router.put('/products/:productId',protect, uploadProducts.single('imageUrl'), productController.updateProduct); 

router.post('/products/:productId/description', productController.addDescriptionPoint);

router.delete('/products/:productId/description', productController.deleteDescriptionPoint);

router.put('/products/:productId/description/:index', productController.editDescriptionPoint);

module.exports = router;
