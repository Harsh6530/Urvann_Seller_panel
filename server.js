const express = require('express');
const mongoose = require('mongoose');
const { Types } = mongoose; 
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const Photo = require('./models/photo');
const User = require('./models/userDetails');
const DeliveryUpdate = require('./models/deliveryUpdate');
const Summary = require('./models/Summary');
const Payable = require('./models/Payable');
const Refund = require('./models/Refund');
const Product = require('./models/Product');
const Review = require('./models/Review');

app.use(express.json());
app.use(cors());

// MongoDB connection URI for UrvannRiderApp database
const MONGODB_URI = 'mongodb+srv://sambhav:UrvannGenie01@urvanngenie.u7r4o.mongodb.net/UrvannSellerApp?retryWrites=true&w=majority&appName=UrvannGenie';

// Connect to MongoDB for UrvannRiderApp database
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected to UrvannRiderApp'))
  .catch(err => console.error(err));

// MongoDB connection URI for UrvannHubRouteData database
const MONGODB_URI_ROUTE = 'mongodb+srv://sambhav:UrvannGenie01@urvanngenie.u7r4o.mongodb.net/UrvannHubRouteData?retryWrites=true&w=majority&appName=UrvannGenie';

// Create a separate connection for the UrvannHubRouteData database
const routeConnection = mongoose.createConnection(MONGODB_URI_ROUTE);

routeConnection.on('connected', () => {
  console.log('MongoDB connected to UrvannHubRouteData');
});

routeConnection.on('error', (err) => {
  console.error(err);
});

// Hardcoded JWT secret key (use this only for development/testing)
const JWT_SECRET = 'your_secret_key'; // Replace 'your_secret_key' with a strong secret key

// Register route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      password, // Store the password as it is
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
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Fetch all collection names in UrvannHubRouteData
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    // Check each collection for the seller's name
    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: username });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    // Dynamically set the collection for the Route model
    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

    // Proceed with further processing using the matched Route collection
    const token = jwt.sign({ userId: user._id, collection: matchingCollectionName }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET /api/sellers
app.get('/api/sellers', async (req, res) => {
  try {
    const sellers = await Route.distinct('seller_name');
    res.json(sellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// // GET /api/sellers/:seller_name/riders
// app.get('/api/sellers/:seller_name/riders', async (req, res) => {
//   const { seller_name } = req.params;

//   try {
//     const collections = await routeConnection.db.listCollections().toArray();
//     let matchingCollectionName;

//     // Check each collection for the seller's name
//     for (const collection of collections) {
//       const currentCollection = routeConnection.collection(collection.name);
//       const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
//       if (foundSeller) {
//         matchingCollectionName = collection.name;
//         break;
//       }
//     }

//     if (!matchingCollectionName) {
//       return res.status(404).json({ message: 'Seller not found in any collection' });
//     }

//     // Dynamically set the collection for the Route model
//     const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);
//     const riders = await Route.find({ seller_name }).distinct('Driver Name').lean();

//     const ridersWithCounts = await Promise.all(riders.map(async (riderCode) => {
//       const productCount = await Route.aggregate([
//         { $match: { seller_name, 'Driver Name': riderCode } },
//         { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
//       ]);

//       return {
//         riderCode,
//         productCount: productCount.length > 0 ? productCount[0].totalQuantity : 0
//       };
//     }));

//     res.json(ridersWithCounts);
//   } catch (error) {
//     console.error('Error fetching riders:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// // GET /api/sellers/:seller_name/all
// app.get('/api/sellers/:seller_name/all', async (req, res) => {
//   const { seller_name } = req.params;

//   try {
//     const collections = await routeConnection.db.listCollections().toArray();
//     let matchingCollectionName;

//     // Check each collection for the seller's name
//     for (const collection of collections) {
//       const currentCollection = routeConnection.collection(collection.name);
//       const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
//       if (foundSeller) {
//         matchingCollectionName = collection.name;
//         break;
//       }
//     }

//     if (!matchingCollectionName) {
//       return res.status(404).json({ message: 'Seller not found in any collection' });
//     }

//     // Dynamically set the collection for the Route model
//     const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);
//     // Fetch products for the seller
//     const products = await Route.find({ seller_name }).lean();

//     // Calculate total quantity of products for the seller
//     const productCount = await Route.aggregate([
//       { $match: { seller_name } },
//       { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
//     ]);
//     const totalProductCount = productCount.length > 0 ? productCount[0].totalQuantity : 0;

//     // Send response with total product count and products
//     res.json({ totalProductCount, products });
//   } catch (error) {
//     console.error(`Error fetching all products for ${seller_name}:`, error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// GET /api/sellers/:seller_name/all?pickup_status=picked
app.get('/api/sellers/:seller_name/all', async (req, res) => {
  const { seller_name } = req.params;
  const { pickup_status } = req.query; // pickup_status is optional

  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    // Check each collection for the seller's name
    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    // Dynamically set the collection for the Route model
    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

    // Build the query object based on the pickup_status query parameter
    let query = { seller_name };
    if (pickup_status) {
      query.Pickup_Status = pickup_status === 'picked' ? 'Picked' : 'Not Picked';
    }

    // Fetch products for the seller based on the query
    const products = await Route.find(query).lean();

    // Calculate total quantity of products for the seller based on the query
    const productCount = await Route.aggregate([
      { $match: query },
      { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
    ]);
    const totalProductCount = productCount.length > 0 ? productCount[0].totalQuantity : 0;

    // Send response with total product count and products
    res.json({ totalProductCount, products });
  } catch (error) {
    console.error(`Error fetching products for ${seller_name} with pickup status '${pickup_status}':`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET /api/sellers/:seller_name/drivers/not-picked
app.get('/api/sellers/:seller_name/drivers/not-picked', async (req, res) => {
  const { seller_name } = req.params;

  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    // Check each collection for the seller's name
    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    // Dynamically set the collection for the Route model
    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);
    // Fetch all unique driver names for the seller where Pickup_Status is "Not Picked"
    const drivers = await Route.distinct('Driver Name', { seller_name, Pickup_Status: 'Not Picked' });

    // If you need to get the count of "Not Picked" products per driver
    const driversWithCounts = await Promise.all(drivers.map(async (driverName) => {
      const productCount = await Route.aggregate([
        { $match: { seller_name, 'Driver Name': driverName, Pickup_Status: 'Not Picked' } },
        { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
      ]);

      return {
        driverName,
        productCount: productCount.length > 0 ? productCount[0].totalQuantity : 0
      };
    }));

    // Send response with the list of drivers and their product counts
    res.json(driversWithCounts);
  } catch (error) {
    console.error(`Error fetching drivers with not picked products for seller ${seller_name}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/sellers/:seller_name/drivers/picked', async (req, res) => {
  const { seller_name } = req.params;

  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    // Check each collection for the seller's name
    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    // Dynamically set the collection for the Route model
    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);
    
    // Fetch all unique driver names for the seller where Pickup_Status is "Picked"
    const drivers = await Route.distinct('Driver Name', { seller_name, Pickup_Status: 'Picked' });

    // If you need to get the count of "Picked" products per driver
    const driversWithCounts = await Promise.all(drivers.map(async (driverName) => {
      const productCount = await Route.aggregate([
        { $match: { seller_name, 'Driver Name': driverName, Pickup_Status: 'Picked' } },
        { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
      ]);

      //console.log(`Driver: ${driverName}, Product Count:`, productCount); // Debugging line

      return {
        driverName,
        productCount: productCount.length > 0 ? productCount[0].totalQuantity : 0
      };
    }));

    // Log the final result
    console.log('Drivers with counts:', driversWithCounts);

    // Send response with the list of drivers and their product counts
    res.json(driversWithCounts);
  } catch (error) {
    console.error(`Error fetching drivers with picked products for seller ${seller_name}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/driver/:seller_name/reverse-pickup-sellers', async (req, res) => {
  const { seller_name } = req.params;
  console.log(`Fetching riders for seller: ${seller_name}`);

  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    // Check each collection for the seller's name
    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    // Dynamically set the collection for the Route model
    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

    // Find the distinct riders (drivers) for the given seller, order types, and delivery status
    const riders = await Route.find({
      seller_name,
      metafield_order_type: { $in: ['Delivery Failed', 'Replacement', 'Reverse Pickup'] },
      Delivery_Status: 'Delivered' // Fetch only those with Delivery_Status as Delivered
    }).distinct('Driver Name');

    const ridersWithCounts = await Promise.all(riders.map(async (driverName) => {
      const productCount = await Route.aggregate([
        {
          $match: {
            'Driver Name': driverName,
            seller_name,
            metafield_order_type: { $in: ['Delivery Failed', 'Replacement', 'Reverse Pickup'] },
            Delivery_Status: 'Delivered' // Match only products that are delivered
          }
        },
        { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
      ]);

      return {
        driverName,
        productCount: productCount[0] ? productCount[0].totalQuantity : 0
      };
    }));

    res.json(ridersWithCounts);
  } catch (error) {
    console.error(`Error fetching riders and counts for seller ${seller_name}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/driver/:seller_name/reverse-pickup-sellers-not-delivered', async (req, res) => {
  const { seller_name } = req.params;
  console.log(`Fetching riders for seller: ${seller_name}`);

  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    // Check each collection for the seller's name
    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    // Dynamically set the collection for the Route model
    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

    // Find the distinct riders (drivers) for the given seller, order types, and delivery status
    const riders = await Route.find({
      seller_name,
      metafield_order_type: { $in: ['Delivery Failed', 'Replacement', 'Reverse Pickup'] },
      Delivery_Status: 'Not Delivered' // Fetch only those with Delivery_Status as Delivered
    }).distinct('Driver Name');

    const ridersWithCounts = await Promise.all(riders.map(async (driverName) => {
      const productCount = await Route.aggregate([
        {
          $match: {
            'Driver Name': driverName,
            seller_name,
            metafield_order_type: { $in: ['Delivery Failed', 'Replacement', 'Reverse Pickup'] },
            Delivery_Status: 'Not Delivered' // Match only products that are delivered
          }
        },
        { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
      ]);

      return {
        driverName,
        productCount: productCount[0] ? productCount[0].totalQuantity : 0
      };
    }));

    res.json(ridersWithCounts);
  } catch (error) {
    console.error(`Error fetching riders and counts for seller ${seller_name}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/products/:seller_name', async (req, res) => {
  const { seller_name } = req.params;
  
  try {
    const products = await Product.find({ seller_name: seller_name });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET endpoint to fetch reviews for a specific seller
app.get('/api/reviews/:sellerName', async (req, res) => {
  const { sellerName } = req.params;

  try {
    const reviews = await Review.find({ seller_name: sellerName });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.put('/api/reviews/:id', async (req, res) => {
  const reviewId = req.params.id;

  if (!Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
  }

  try {
      const updatedData = req.body;

      if (updatedData.Available !== undefined) {
          updatedData.Available = updatedData.Available === 'yes' ? 1 : 0;
      }

      // Ensure the correct field name is being used
      if (updatedData["Suggested Price"] !== undefined) {
          updatedData["Suggested Price"] = parseFloat(updatedData["Suggested Price"]) || 0;
      }

      if (updatedData["Current Price"] !== undefined) {
          updatedData["Current Price"] = parseFloat(updatedData["Current Price"]) || 0;
      }

      const updatedReview = await Review.findByIdAndUpdate(reviewId, updatedData, { new: true });

      if (!updatedReview) {
          return res.status(404).json({ message: 'Review not found' });
      }

      res.json(updatedReview);
  } catch (error) {
      console.error('Error updating review:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// app.get('/api/products', async (req, res) => {
//   const { seller_name, rider_code } = req.query;
//   try {
//     const collections = await routeConnection.db.listCollections().toArray();
//     let matchingCollectionName;

//     // Check each collection for the seller's name
//     for (const collection of collections) {
//       const currentCollection = routeConnection.collection(collection.name);
//       const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
//       if (foundSeller) {
//         matchingCollectionName = collection.name;
//         break;
//       }
//     }

//     if (!matchingCollectionName) {
//       return res.status(404).json({ message: 'Seller not found in any collection' });
//     }

//     // Dynamically set the collection for the Route model
//     const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);
//     let query = { seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } };
//     if (rider_code !== 'all') {
//       query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
//     }

//     const filteredData = await Route.find(query)
//       .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price Pickup_Status') // Include Pickup_Status
//       .sort({ GMV: -1 }) // Sort by GMV in decreasing order
//       .lean();

//     const skuList = filteredData.map(data => data.line_item_sku);

//     const photos = await Photo.find({ sku: { $in: skuList } }).lean();
//     const photoMap = {};
//     photos.forEach(photo => {
//       photoMap[photo.sku] = photo.image_url;
//     });

//     const mergedData = filteredData.map(data => ({
//       ...data,
//       image1: photoMap[data.line_item_sku] || null
//     }));

//     const orderCodeQuantities = mergedData.reduce((acc, data) => {
//       acc[data.FINAL] = (acc[data.FINAL] || 0) + data.total_item_quantity;
//       return acc;
//     }, {});

//     const products = mergedData.map(data => ({
//       FINAL: data.FINAL,
//       line_item_sku: data.line_item_sku,
//       line_item_name: data.line_item_name,
//       image1: data.image1,
//       total_item_quantity: data.total_item_quantity,
//       line_item_price: data.line_item_price,
//       Pickup_Status: data.Pickup_Status, // Include Pickup_Status
//       GMV: data.GMV
//     }));

//     console.log('Products:', products); // Log the products to verify data

//     res.json({ orderCodeQuantities, products });
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/api/products', async (req, res) => {
//   const { seller_name, rider_code } = req.query;
//   try {
//     const collections = await routeConnection.db.listCollections().toArray();
//     let matchingCollectionName;

//     // Check each collection for the seller's name
//     for (const collection of collections) {
//       const currentCollection = routeConnection.collection(collection.name);
//       const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
//       if (foundSeller) {
//         matchingCollectionName = collection.name;
//         break;
//       }
//     }

//     if (!matchingCollectionName) {
//       return res.status(404).json({ message: 'Seller not found in any collection' });
//     }

//     // Dynamically set the collection for the Route model
//     const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);
    
//     let query = { seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } };
//     if (rider_code !== 'all') {
//       query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
//     }

//     const filteredData = await Route.find(query)
//       .select('FINAL line_item_sku line_item_name total_item_quantity') // Ensure fields match the document
//       //.sort({ GMV: -1 }) // Sort by GMV in decreasing order
//       .lean();

//     const skuList = filteredData.map(data => data.line_item_sku);

//     const photos = await Photo.find({ sku: { $in: skuList } }).lean();
//     const photoMap = {};
//     photos.forEach(photo => {
//       photoMap[photo.sku] = photo.image_url;
//     });

//     const mergedData = filteredData.map(data => ({
//       ...data,
//       image1: photoMap[data.line_item_sku] || null
//     }));

//     const orderCodeQuantities = mergedData.reduce((acc, data) => {
//       acc[data.FINAL] = (acc[data.FINAL] || 0) + data.total_item_quantity;
//       return acc;
//     }, {});

//     const products = mergedData.map(data => ({
//       FINAL: data.FINAL,
//       line_item_sku: data.line_item_sku,
//       line_item_name: data.line_item_name,
//       image1: data.image1,
//       total_item_quantity: data.total_item_quantity
//     }));

//     console.log('Products:', products); // Log the products to verify data

//     res.json({ orderCodeQuantities, products });
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

app.get('/api/products/not-picked', async (req, res) => {
  const { seller_name, rider_code } = req.query;
  
  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

    const query = { 
      seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
      Pickup_Status: 'Not Picked'
    };

    if (rider_code !== 'all') {
      query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
    }

    const filteredData = await Route.find(query)
      .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price Pickup_Status') 
      .sort({ GMV: -1 })
      .lean();

    //console.log('Filtered Data:', filteredData); // Debugging

    const skuList = filteredData.map(data => data.line_item_sku);
    const photos = await Photo.find({ sku: { $in: skuList } }).lean();
    const photoMap = {};
    photos.forEach(photo => {
      photoMap[photo.sku] = photo.image_url;
    });

    const mergedData = filteredData.map(data => ({
      ...data,
      image1: photoMap[data.line_item_sku] || null,
      line_item_price: Number(data.line_item_price) // Ensure it's a number
    }));

    //console.log('Merged Data:', mergedData); // Debugging

    const orderCodeQuantities = mergedData.reduce((acc, data) => {
      acc[data.FINAL] = (acc[data.FINAL] || 0) + data.total_item_quantity;
      return acc;
    }, {});

    //console.log('Order Code Quantities:', orderCodeQuantities); // Debugging

    const products = mergedData.map(data => ({
      FINAL: data.FINAL,
      line_item_sku: data.line_item_sku,
      line_item_name: data.line_item_name,
      image1: data.image1,
      total_item_quantity: data.total_item_quantity,
      line_item_price: data.line_item_price,
      Pickup_Status: data.Pickup_Status,
      GMV: data.GMV
    }));

    res.json({ orderCodeQuantities, products });
  } catch (error) {
    console.error('Error fetching picked products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/products/picked', async (req, res) => {
  const { seller_name, rider_code } = req.query;
  
  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

    const query = { 
      seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
      Pickup_Status: 'Picked'
    };

    if (rider_code !== 'all') {
      query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
    }

    const filteredData = await Route.find(query)
      .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price Pickup_Status') 
      .sort({ GMV: -1 })
      .lean();

    //console.log('Filtered Data:', filteredData); // Debugging

    const skuList = filteredData.map(data => data.line_item_sku);
    const photos = await Photo.find({ sku: { $in: skuList } }).lean();
    const photoMap = {};
    photos.forEach(photo => {
      photoMap[photo.sku] = photo.image_url;
    });

    const mergedData = filteredData.map(data => ({
      ...data,
      image1: photoMap[data.line_item_sku] || null,
      line_item_price: Number(data.line_item_price) // Ensure it's a number
    }));

    //console.log('Merged Data:', mergedData); // Debugging

    const orderCodeQuantities = mergedData.reduce((acc, data) => {
      acc[data.FINAL] = (acc[data.FINAL] || 0) + data.total_item_quantity;
      return acc;
    }, {});

    //console.log('Order Code Quantities:', orderCodeQuantities); // Debugging

    const products = mergedData.map(data => ({
      FINAL: data.FINAL,
      line_item_sku: data.line_item_sku,
      line_item_name: data.line_item_name,
      image1: data.image1,
      total_item_quantity: data.total_item_quantity,
      line_item_price: data.line_item_price,
      Pickup_Status: data.Pickup_Status,
      GMV: data.GMV
    }));

    res.json({ orderCodeQuantities, products });
  } catch (error) {
    console.error('Error fetching picked products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/reverse-pickup-products-delivered', async (req, res) => {
  const { seller_name, rider_code } = req.query;

  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

    const query = { 
      seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
      metafield_order_type: { $in: ['Reverse Pickup', 'Replacement', 'Delivery Failed'] },
      Delivery_Status: 'Delivered' // Add the condition to fetch only delivered products
    };

    if (rider_code !== 'all') {
      query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
    }

    const filteredData = await Route.find(query)
      .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price metafield_order_type Delivery_Status') 
      .sort({ GMV: -1 })
      .lean();

    const skuList = filteredData.map(data => data.line_item_sku);
    const photos = await Photo.find({ sku: { $in: skuList } }).lean();
    const photoMap = {};
    photos.forEach(photo => {
      photoMap[photo.sku] = photo.image_url;
    });

    const mergedData = filteredData.map(data => ({
      ...data,
      image1: photoMap[data.line_item_sku] || null,
      line_item_price: Number(data.line_item_price) // Ensure it's a number
    }));

    const orderCodeQuantities = mergedData.reduce((acc, data) => {
      acc[data.FINAL] = (acc[data.FINAL] || 0) + data.total_item_quantity;
      return acc;
    }, {});

    const products = mergedData.map(data => ({
      FINAL: data.FINAL,
      line_item_sku: data.line_item_sku,
      line_item_name: data.line_item_name,
      image1: data.image1,
      total_item_quantity: data.total_item_quantity,
      line_item_price: data.line_item_price,
      Delivery_Status: data.Delivery_Status,
      metafield_order_type: data.metafield_order_type,
      GMV: data.GMV
    }));

    res.json({ orderCodeQuantities, products });
  } catch (error) {
    console.error('Error fetching picked products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/reverse-pickup-products-not-delivered', async (req, res) => {
  const { seller_name, rider_code } = req.query;

  try {
    const collections = await routeConnection.db.listCollections().toArray();
    let matchingCollectionName;

    for (const collection of collections) {
      const currentCollection = routeConnection.collection(collection.name);
      const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
      if (foundSeller) {
        matchingCollectionName = collection.name;
        break;
      }
    }

    if (!matchingCollectionName) {
      return res.status(404).json({ message: 'Seller not found in any collection' });
    }

    const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

    const query = { 
      seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
      metafield_order_type: { $in: ['Reverse Pickup', 'Replacement', 'Delivery Failed'] },
      Delivery_Status: 'Not Delivered' // Add the condition to fetch only delivered products
    };

    if (rider_code !== 'all') {
      query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
    }

    const filteredData = await Route.find(query)
      .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price metafield_order_type Delivery_Status') 
      .sort({ GMV: -1 })
      .lean();

    const skuList = filteredData.map(data => data.line_item_sku);
    const photos = await Photo.find({ sku: { $in: skuList } }).lean();
    const photoMap = {};
    photos.forEach(photo => {
      photoMap[photo.sku] = photo.image_url;
    });

    const mergedData = filteredData.map(data => ({
      ...data,
      image1: photoMap[data.line_item_sku] || null,
      line_item_price: Number(data.line_item_price) // Ensure it's a number
    }));

    const orderCodeQuantities = mergedData.reduce((acc, data) => {
      acc[data.FINAL] = (acc[data.FINAL] || 0) + data.total_item_quantity;
      return acc;
    }, {});

    const products = mergedData.map(data => ({
      FINAL: data.FINAL,
      line_item_sku: data.line_item_sku,
      line_item_name: data.line_item_name,
      image1: data.image1,
      total_item_quantity: data.total_item_quantity,
      line_item_price: data.line_item_price,
      Delivery_Status: data.Delivery_Status,
      metafield_order_type: data.metafield_order_type,
      GMV: data.GMV
    }));

    res.json({ orderCodeQuantities, products });
  } catch (error) {
    console.error('Error fetching picked products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// app.get('/api/reverse-pickup-products', async (req, res) => {
//   const { seller_name, driverName } = req.query;

//   try {
//     const collections = await routeConnection.db.listCollections().toArray();
//     let matchingCollectionName;

//     for (const collection of collections) {
//       const currentCollection = routeConnection.collection(collection.name);
//       const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
//       if (foundSeller) {
//         matchingCollectionName = collection.name;
//         break;
//       }
//     }

//     if (!matchingCollectionName) {
//       return res.status(404).json({ message: 'Seller not found in any collection' });
//     }

//     const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

//     // Build the query to filter based on seller name and driver name
//     let query = {
//       seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') }, // Case-insensitive match for seller name
//       "Driver Name": { $regex: new RegExp(`^${driverName}$`, 'i') }, // Case-insensitive match for driver name
//       metafield_order_type: { $in: ['Reverse Pickup', 'Replacement', 'Delivery Failed'] } // Filter based on order types
//     };

//     // Find matching documents from the Route collection
//     const filteredData = await Route.find(query)
//       .select('FINAL line_item_sku line_item_name total_item_quantity Pickup_Status')
//       .lean();

//     // Extract SKUs to fetch associated photos
//     const skuList = filteredData.map(data => data.line_item_sku);
//     const photos = await Photo.find({ sku: { $in: skuList } }).lean();

//     // Map the photos to their respective SKUs
//     const photoMap = {};
//     photos.forEach(photo => {
//       photoMap[photo.sku] = photo.image_url;
//     });

//     // Map the filtered data to include photo URLs and other details
//     const products = filteredData.map(data => ({
//       FINAL: data.FINAL,
//       line_item_sku: data.line_item_sku,
//       line_item_name: data.line_item_name,
//       image1: photoMap[data.line_item_sku] || null, // Default to null if no image is found
//       total_item_quantity: data.total_item_quantity,
//       "Pickup Status": data.Pickup_Status
//     }));

//     // Calculate total quantities by order code (FINAL)
//     const orderCodeQuantities = products.reduce((acc, product) => {
//       acc[product.FINAL] = (acc[product.FINAL] || 0) + product.total_item_quantity;
//       return acc;
//     }, {});

//     // Return the response as a JSON object
//     res.json({ orderCodeQuantities, products });
//   } catch (error) {
//     console.error('Error fetching reverse pickup products:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });



app.get('/api/data/:sellerName', async (req, res) => {
  try {
    const sellerName = req.params.sellerName;

    // Fetch only the Date, Delivered, and Penalty fields
    const deliveryUpdates = await DeliveryUpdate.find({ 'Seller name': sellerName }, 'Date Delivered Penalty');

    res.json({ deliveryUpdates });
  } catch (err) {
    console.error('Error fetching data:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint for Summary
app.get('/api/summary/:sellerName', async (req, res) => {
  try {
    const sellerName = req.params.sellerName;
    console.log(`Fetching summary for seller: ${sellerName}`);

    const summary = await Summary.findOne({ Name: sellerName });

    if (!summary) {
      console.log('Summary not found');
      return res.status(404).json({ message: 'Summary not found' });
    }

    res.json(summary);
  } catch (err) {
    console.error('Error fetching summary:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint for Refund
app.get('/api/refund/:sellerName', async (req, res) => {
  try {
    const sellerName = req.params.sellerName;
    const refunds = await Refund.find({ Seller: sellerName });

    res.json(refunds);
  } catch (err) {
    console.error('Error fetching refunds:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint for Payable
app.get('/api/payable/:sellerName', async (req, res) => {
  try {
    const sellerName = req.params.sellerName;
    const payables = await Payable.find({ seller_name: sellerName });

    res.json(payables);
  } catch (err) {
    console.error('Error fetching payables:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
