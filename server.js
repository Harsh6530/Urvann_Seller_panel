const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const Photo = require('./models/photo');
const User = require('./models/userDetails');
const DeliveryUpdate = require('./models/deliveryUpdate');
const Summary = require('./models/Summary');
const Payable = require('./models/Payable');
const Refund = require('./models/Refund');

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

// GET /api/sellers/:seller_name/riders
app.get('/api/sellers/:seller_name/riders', async (req, res) => {
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
    const riders = await Route.find({ seller_name }).distinct('Driver Name').lean();

    const ridersWithCounts = await Promise.all(riders.map(async (riderCode) => {
      const productCount = await Route.aggregate([
        { $match: { seller_name, 'Driver Name': riderCode } },
        { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
      ]);

      return {
        riderCode,
        productCount: productCount.length > 0 ? productCount[0].totalQuantity : 0
      };
    }));

    res.json(ridersWithCounts);
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET /api/sellers/:seller_name/all
app.get('/api/sellers/:seller_name/all', async (req, res) => {
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
    // Fetch products for the seller
    const products = await Route.find({ seller_name }).lean();

    // Calculate total quantity of products for the seller
    const productCount = await Route.aggregate([
      { $match: { seller_name } },
      { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
    ]);
    const totalProductCount = productCount.length > 0 ? productCount[0].totalQuantity : 0;

    // Send response with total product count and products
    res.json({ totalProductCount, products });
  } catch (error) {
    console.error(`Error fetching all products for ${seller_name}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sellers/:seller_name/drivers/not-picked
// app.get('/api/sellers/:seller_name/drivers/not-picked', async (req, res) => {
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

//     // Fetch all unique driver names for the seller where Pickup_Status is "Not Picked"
//     const drivers = await Route.distinct('Driver Name', { seller_name, Pickup_Status: 'Not Picked' });

//     // If you need to get the count of "Not Picked" products per driver
//     const driversWithCounts = await Promise.all(drivers.map(async (driverName) => {
//       const productCount = await Route.aggregate([
//         { $match: { seller_name, 'Driver Name': driverName, Pickup_Status: 'Not Picked' } },
//         { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
//       ]);

//       return {
//         driverName,
//         productCount: productCount.length > 0 ? productCount[0].totalQuantity : 0
//       };
//     }));

//     // Send response with the list of drivers and their product counts
//     res.json(driversWithCounts);
//   } catch (error) {
//     console.error(`Error fetching drivers with not picked products for seller ${seller_name}:`, error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // GET /api/sellers/:seller_name/drivers/picked
// app.get('/api/sellers/:seller_name/drivers/picked', async (req, res) => {
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
//     // Fetch all unique driver names for the seller where Pickup_Status is "Not Picked"
//     const drivers = await Route.distinct('Driver Name', { seller_name, Pickup_Status: 'Picked' });

//     // If you need to get the count of "Not Picked" products per driver
//     const driversWithCounts = await Promise.all(drivers.map(async (driverName) => {
//       const productCount = await Route.aggregate([
//         { $match: { seller_name, 'Driver Name': driverName, Pickup_Status: 'Picked' } },
//         { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
//       ]);

//       return {
//         driverName,
//         productCount: productCount.length > 0 ? productCount[0].totalQuantity : 0
//       };
//     }));

//     // Send response with the list of drivers and their product counts
//     res.json(driversWithCounts);
//   } catch (error) {
//     console.error(`Error fetching drivers with not picked products for seller ${seller_name}:`, error);
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

app.get('/api/products', async (req, res) => {
  const { seller_name, rider_code } = req.query;
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
    
    let query = { seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } };
    if (rider_code !== 'all') {
      query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
    }

    const filteredData = await Route.find(query)
      .select('FINAL line_item_sku line_item_name total_item_quantity') // Ensure fields match the document
      //.sort({ GMV: -1 }) // Sort by GMV in decreasing order
      .lean();

    const skuList = filteredData.map(data => data.line_item_sku);

    const photos = await Photo.find({ sku: { $in: skuList } }).lean();
    const photoMap = {};
    photos.forEach(photo => {
      photoMap[photo.sku] = photo.image_url;
    });

    const mergedData = filteredData.map(data => ({
      ...data,
      image1: photoMap[data.line_item_sku] || null
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
      total_item_quantity: data.total_item_quantity
    }));

    console.log('Products:', products); // Log the products to verify data

    res.json({ orderCodeQuantities, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// app.get('/api/products/picked', async (req, res) => {
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

//     let query = { 
//       seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
//       Pickup_Status: 'Picked' // Filter for picked products
//     };
    
//     if (rider_code !== 'all') {
//       query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
//     }

//     const filteredData = await Route.find(query)
//       .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price Pickup_Status') 
//       .sort({ GMV: -1 })
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
//       Pickup_Status: data.Pickup_Status,
//       GMV: data.GMV
//     }));

//     res.json({ orderCodeQuantities, products });
//   } catch (error) {
//     console.error('Error fetching picked products:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/api/products/not-picked', async (req, res) => {
//   const { seller_name, rider_code } = req.query;
//   try {
//     // Fetch all collection names in UrvannHubRouteData
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

    
//     let query = { 
//       seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
//       Pickup_Status: 'Not Picked' // Filter for not picked products
//     };
    
//     if (rider_code !== 'all') {
//       query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
//     }

//     const filteredData = await Route.find(query)
//       .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price Pickup_Status') 
//       .sort({ GMV: -1 })
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
//       Pickup_Status: data.Pickup_Status,
//       GMV: data.GMV
//     }));

//     res.json({ orderCodeQuantities, products });
//   } catch (error) {
//     console.error('Error fetching not picked products:', error);
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
