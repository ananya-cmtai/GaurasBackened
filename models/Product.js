const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  pricePerUnit: Number,
  stock: Number,
  isActive: Boolean
});

module.exports = mongoose.model('Product', ProductSchema);
