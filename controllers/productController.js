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
  const { name, category, price, stock, quantity, description } = req.body;
  // description expected to be an array of strings
  // if it comes as string (single point), convert to array
  let descArray = [];
  if (description) {
    if (Array.isArray(description)) {
      descArray = description;
    } else if (typeof description === 'string') {
      descArray = [description];
    }
  }

  try {
    const product = await Product.create({
      name,
      category,
      price,
      stock,
      quantity,
      description: descArray,
      imageUrl: req.file ? req.file.path : null,
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add product' });
  }
};

exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, category, price, stock, quantity, description } = req.body;

  const updateFields = {};

  if (name) updateFields.name = name;
  if (category) updateFields.category = category;
  if (price) updateFields.price = price;
  if (stock) updateFields.stock = stock;
  if (quantity) updateFields.quantity = quantity;

  // description updates here (replace full array if provided)
  if (description) {
    if (Array.isArray(description)) {
      updateFields.description = description;
    } else if (typeof description === 'string') {
      updateFields.description = [description];
    }
  }

  if (req.file) updateFields.imageUrl = req.file.path;

  try {
    const product = await Product.findByIdAndUpdate(productId, updateFields, { new: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};
// Add a description point
exports.addDescriptionPoint = async (req, res) => {
  const { productId } = req.params;
  const { point } = req.body; // point is a string to add

  if (!point || typeof point !== 'string') {
    return res.status(400).json({ message: 'Description point is required and should be a string' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.description = product.description || [];
    product.description.push(point);

    await product.save();

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add description point' });
  }
};

// Delete a description point by exact match
exports.deleteDescriptionPoint = async (req, res) => {
  const { productId } = req.params;
  const { point } = req.body;

  if (!point || typeof point !== 'string') {
    return res.status(400).json({ message: 'Description point is required and should be a string' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.description = product.description.filter(desc => desc !== point);

    await product.save();

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete description point' });
  }
};

// Edit a description point by index
exports.editDescriptionPoint = async (req, res) => {
  const { productId, index } = req.params; // index is index of description point
  const { newPoint } = req.body;

  if (typeof newPoint !== 'string') {
    return res.status(400).json({ message: 'New description point is required and should be a string' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!product.description || !product.description[index]) {
      return res.status(400).json({ message: 'Invalid description index' });
    }

    product.description[index] = newPoint;

    await product.save();

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to edit description point' });
  }
};
