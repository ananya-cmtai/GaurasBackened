// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Milk', 'Butter', 'Cheese', 'Yogurt', 'Ghee'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description:{
     type:String,
  },
  stock: {
    type: Number,
    default: 0, 
  },
  imageUrl: {
    type: String,
    default: '', 
  },
  quantity:{
    type: String,
    
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
