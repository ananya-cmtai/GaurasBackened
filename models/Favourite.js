const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favouriteItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming products are stored in a Product model
    ref: 'Product',
    required: true,
  },
  name: String,
  price: Number,
  imageUrl: String,

  quantity: String,

});

const favouriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user has one cart
  },
  items: [favouriteItemSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Favourite', favouriteSchema);

