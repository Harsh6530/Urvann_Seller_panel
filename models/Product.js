const mongoose = require('mongoose');

const payableSchema = new mongoose.Schema({
  image_url: String,
  Name: String,
  'Additional Info': String,
  Size: Number,
  Pot: String,
  "Seller Price": Number,
  seller_name: String
});

const Product = mongoose.model('Product', payableSchema, 'Product');

module.exports = Product;
