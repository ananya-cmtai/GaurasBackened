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
  dailyPrice:{
     type:[Number],
    
  },
  alternatePrice:{
 type:[Number],
    
  },
  weeklyPrice:{
 type:[Number],

  },
  price: {
    type: [Number],
    required: true,
  },
  description:{
     type:[String],
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
    type: [String],
    
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
productSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('price')) {
    if (!this.dailyPrice || this.dailyPrice.length === 0) {
      this.dailyPrice = this.price.map(p => p * 30);
    }
    if (!this.alternatePrice || this.alternatePrice.length === 0) {
      this.alternatePrice = this.price.map(p => p * 15);
    }
    if (!this.weeklyPrice || this.weeklyPrice.length === 0) {
      this.weeklyPrice = this.price.map(p => p * 4);
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
