const mongoose = require('mongoose');

const payableSchema = new mongoose.Schema({
  image_url: String,
  Name: String,
  'Additional Info': String,
  Size: String,
  Pot: String,
  "Seller Price": String,
  seller_name: String
});

const Product = mongoose.model('Product', payableSchema, 'Product');

module.exports = Product;
