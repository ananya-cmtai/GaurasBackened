const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    imageUrl:{type :String, required: true},
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: true });

const featuredCategorySchema = new Schema({
  title: { type: String, required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
});

const homeSchema = new Schema({
  banners: [bannerSchema],
  featuredSections: [featuredCategorySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Home', homeSchema);
