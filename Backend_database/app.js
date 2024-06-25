const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// MongoDB connection URI
const MONGODB_URI = 'mongodb+srv://sharmaharsh634:urvann%401234@sellerlogin.cjywul3.mongodb.net/?retryWrites=true&w=majority&appName=SellerLogin';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Load your User schema from './userDetails'
const User = require('./userDetails');

// Hardcoded JWT secret key (use this only for development/testing)
const JWT_SECRET = 'your_secret_key'; // Replace 'your_secret_key' with a strong secret key

// Load Excel data into pandas DataFrames from the correct sheets
const df_seller = xlsx.readFile('Seller.xlsx').Sheets['Order data'];
const df_products = xlsx.readFile('Products.xlsx').Sheets['Order data'];

// Routes
// Register route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({
      username,
      password: hashedPassword,
    });

    // Save user to database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Example endpoints from Flask integration
// GET /api/sellers
app.get('/api/sellers', (req, res) => {
  try {
    const df_seller_json = xlsx.utils.sheet_to_json(df_seller);
    const uniqueSellers = [...new Set(df_seller_json.map(seller => seller['seller_name']))];
    res.json(uniqueSellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sellers/:seller_name/riders
app.get('/api/sellers/:seller_name/riders', (req, res) => {
  const { seller_name } = req.params;
  try {
    const df_seller_json = xlsx.utils.sheet_to_json(df_seller);
    const riders = df_seller_json.filter(seller => seller['seller_name'] === seller_name).map(seller => seller['Driver Name']);
    const uniqueRiders = [...new Set(riders)];
    const ridersWithCounts = uniqueRiders.map(riderCode => ({
      riderCode,
      productCount: df_seller_json.filter(seller => seller['seller_name'] === seller_name && seller['Driver Name'] === riderCode).reduce((sum, seller) => sum + seller['total_item_quantity'], 0)
    }));
    res.json(ridersWithCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products
app.get('/api/products', (req, res) => {
  const { seller_name, rider_code } = req.query;
  try {
    const df_seller_json = xlsx.utils.sheet_to_json(df_seller);
    const df_products_json = xlsx.utils.sheet_to_json(df_products);
    const filtered_df = df_seller_json.filter(seller => seller['seller_name'] === seller_name && seller['Driver Name'] === rider_code);
    const merged_df = filtered_df.map(seller => {
      const product = df_products_json.find(product => product['sku'] === seller['line_item_sku']);
      return {
        ...seller,
        image1: product ? product['image1'] : null
      };
    });
    const orderCodeQuantities = merged_df.reduce((acc, seller) => {
      acc[seller['FINAL']] = (acc[seller['FINAL']] || 0) + seller['total_item_quantity'];
      return acc;
    }, {});
    const products = merged_df.map(seller => ({
      FINAL: seller['FINAL'],
      line_item_sku: seller['line_item_sku'],
      line_item_name: seller['line_item_name'],
      image1: seller['image1'],
      total_item_quantity: seller['total_item_quantity']
    }));
    res.json({ orderCodeQuantities, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
