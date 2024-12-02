const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();

const connectToDB = require('./middlewares/connectToDB');

const user = require('./controllers/user');
const dailyUpdates = require('./controllers/dailyUpdates');
const payout = require('./controllers/payout');
const reviews = require('./controllers/reviews');
const products = require('./controllers/products');


app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectToDB();

// Register route
app.post('/api/register', user.registerUser);

// Login route
app.post('/api/login', user.loginUser);


// GET /api/sellers
app.get('/api/sellers', products.sellers);

// GET /api/sellers/:seller_name/all?pickup_status=picked
app.get('/api/sellers/:seller_name/all', products.sellersBySellerNameAll);


app.get('/api/sellers/:seller_name/drivers/not-picked', products.sellersBySellerNameDriversNotPicked);


app.get('/api/sellers/:seller_name/drivers/picked', products.sellersBySellerNameDriversPicked);

app.get('/api/driver/:seller_name/reverse-pickup-sellers', products.driversBySellerNameReversePickupSellers);

app.get('/api/driver/:seller_name/reverse-pickup-sellers-not-delivered', products.driversBySellerNameReversePickupSellersNotDelivered);



app.get('/api/products/:seller_name', products.productsBySellerName);

app.put('/api/products/:id', products.productsById);

// GET endpoint to fetch reviews for a specific seller
app.get('/api/reviews/:sellerName', reviews.reviewsBySellerName);

app.put('/api/reviews/:id', reviews.reviewsById);




app.get('/api/not-picked-products', products.notPickedProducts);

app.get('/api/picked-products', products.pickedProducts);


app.get('/api/reverse-pickup-products-delivered', products.reversePickupProductsDelivered);

app.get('/api/reverse-pickup-products-not-delivered', products.reversePickupProductsNotDelivered);






app.get('/api/data/:sellerName', dailyUpdates.getUpdates);

// Endpoint for Summary
app.get('/api/summary/:sellerName', payout.summary);

// Endpoint for Refund
app.get('/api/refund/:sellerName', payout.refund);

// Endpoint for Payable
app.get('/api/payable/:sellerName', payout.payable);



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));