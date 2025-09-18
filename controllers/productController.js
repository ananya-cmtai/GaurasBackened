const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

exports.addProduct = async (req, res) => {
  const { name, category, price, stock, quantity } = req.body;
  try {
    const product = await Product.create({ name, category, price, stock,quantity, imageUrl: req.file ? req.file.path : null,description  });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product' });
  }
};
exports.updateProduct = async (req, res) => {
  const { productId } = req.params; // Assuming the product ID is passed as a URL parameter
  const { name, category, price, stock, quantity ,description} = req.body;
  const updateFields = {};

  // Only update the fields that are provided
  if (name) updateFields.name = name;
  if (category) updateFields.category = category;
  if (price) updateFields.price = price;
  if (stock) updateFields.stock = stock;
  if (quantity) updateFields.quantity = quantity;
   if (description) updateFields.description = description;
  if (req.file) updateFields.imageUrl = req.file.path;

  try {
    const product = await Product.findByIdAndUpdate(productId, updateFields, { new: true });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};