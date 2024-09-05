const mongoose = require('mongoose');

const payableSchema = new mongoose.Schema({
  image_url: String,
  name: String,
  sku: String,
  _id: String,
  "Current Price": Number,
  "Suggested Price": Number,
  Available: Number,
  seller_name: String
});

const Review = mongoose.model('Review', payableSchema, 'Review');

module.exports = Review;
