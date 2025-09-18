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
  const { name, category, price, stock, imageUrl } = req.body;
  try {
    const product = await Product.create({ name, category, price, stock, imageUrl: req.file ? req.file.path : null,  });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product' });
  }
};
