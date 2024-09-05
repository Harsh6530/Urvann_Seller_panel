const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  _id: Schema.Types.ObjectId, // Explicitly define _id as ObjectId
  name: String,
  sku: String,
  image_url: String,
  "Current Price": Number,
  "Suggested Price": Number,
  Available: Number,
  seller_name: String
});

const Review = mongoose.model('Review', reviewSchema, 'Review');

module.exports = Review;
