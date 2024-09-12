const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  sku: String,
  image_url: String,
  "Current Price": Number,
  "Suggested Price": Number,
  Available: Number,
  seller_name: String,
  additional_info: String

});

const Review = mongoose.model('Review', reviewSchema, 'Review');

module.exports = Review;
