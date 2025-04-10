
const Photo = require('../models/photo');
const Route = require("../models/route");
const Product = require('../models/Product');

const sellers = async (req, res) => {
    try {
        const sellers = await Route.distinct('seller_name');
        res.json(sellers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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

const sellersBySellerNameAll = async (req, res) => {
    const { seller_name } = req.params;
    const { pickup_status } = req.query; // pickup_status is optional

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // // Check each collection for the seller's name
        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // // Dynamically set the collection for the Route model
        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

        // Build the query object based on the pickup_status query parameter
        let query = {
            seller_name,
            $or: [
                { metafield_order_type: { $in: ['Replacement'] } },
                { metafield_order_type: { $eq: null } },
                { metafield_order_type: { $eq: '' } } // Add condition for empty string
            ]
        };
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
};

const sellersBySellerNameDriversNotPicked = async (req, res) => {
    const { seller_name } = req.params;

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // // Check each collection for the seller's name
        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // // Dynamically set the collection for the Route model
        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);
        // Fetch all unique driver names for the seller where Pickup_Status is "Not Picked"
        const drivers = await Route.distinct('Driver Name', {
            seller_name,
            Pickup_Status: 'Not Picked',  // Filter for Pickup_Status "Picked"
            $or: [
                { metafield_order_type: { $in: ['Replacement'] } },
                { metafield_order_type: { $eq: null } },
                { metafield_order_type: { $eq: '' } }     // Add condition for empty string
            ]
        });

        // If you need to get the count of "Not Picked" products per driver
        const driversWithCounts = await Promise.all(drivers.map(async (driverName) => {
            const productCount = await Route.aggregate([
                {
                    $match: {
                        seller_name, 'Driver Name': driverName,
                        Pickup_Status: 'Not Picked',  // Ensure only "Picked" products are counted
                        $or: [
                            { metafield_order_type: { $in: ['Replacement'] } },
                            { metafield_order_type: { $eq: null } },
                            { metafield_order_type: { $eq: '' } }
                        ]
                    }
                },
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
};

const sellersBySellerNameDriversPicked = async (req, res) => {
    const { seller_name } = req.params;

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // // Check each collection for the seller's name
        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // // Dynamically set the collection for the Route model
        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

        // Fetch all unique driver names for the seller where Pickup_Status is "Picked"
        const drivers = await Route.distinct('Driver Name', {
            seller_name,
            Pickup_Status: 'Picked',  // Ensure only "Picked" products are counted
            $or: [
                { metafield_order_type: { $in: ['Replacement'] } },
                { metafield_order_type: { $eq: null } },
                { metafield_order_type: { $eq: '' } }
            ]
        });

        // If you need to get the count of "Picked" products per driver
        const driversWithCounts = await Promise.all(drivers.map(async (driverName) => {
            const productCount = await Route.aggregate([
                {
                    $match: {
                        seller_name, 'Driver Name': driverName,
                        Pickup_Status: 'Picked',  // Ensure only "Picked" products are counted
                        $or: [
                            { metafield_order_type: { $in: ['Replacement'] } },
                            { metafield_order_type: { $eq: null } },
                            { metafield_order_type: { $eq: '' } }
                        ]
                    }
                },
                { $group: { _id: null, totalQuantity: { $sum: '$total_item_quantity' } } }
            ]);

            //console.log(`Driver: ${driverName}, Product Count:`, productCount); // Debugging line

            return {
                driverName,
                productCount: productCount.length > 0 ? productCount[0].totalQuantity : 0
            };
        }));

        // Log the final result
        // console.log('Drivers with counts:', driversWithCounts);

        // Send response with the list of drivers and their product counts
        res.json(driversWithCounts);
    } catch (error) {
        console.error(`Error fetching drivers with picked products for seller ${seller_name}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const driversBySellerNameReversePickupSellers = async (req, res) => {
    const { seller_name } = req.params;
    //console.log(`Fetching riders for seller: ${seller_name}`);

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // // Check each collection for the seller's name
        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // // Dynamically set the collection for the Route model
        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

        // Find the distinct riders (drivers) for the given seller, order types, and delivery status
        const riders = await Route.find({
            seller_name,
            $or: [
                // Special case for 'Delivery Failed'
                {
                    metafield_order_type: 'Delivery Failed',
                    'Delivery_Status': 'Delivered'
                },
                // Existing logic for 'Replacement' and 'Reverse Pickup'
                {
                    $and: [
                        {
                            $or: [
                                {
                                    metafield_order_type: { $in: ['Replacement', 'Reverse Pickup'] },
                                    metafield_delivery_status: {
                                        $in: [
                                            'Z-Replacement Successful',
                                            'Z-Reverse Successful',
                                            'A-Delivery Failed (CNR)',
                                            'A-Delivery failed (Rescheduled)',
                                            'Z-Delivery Failed (customer cancelled)',
                                            'A-Delivery Failed (rider side)'
                                        ]
                                    },
                                    'Delivery_Status': 'Delivered'
                                },
                                {
                                    metafield_order_type: { $exists: false }, // Handles cases where metafield_order_type is missing
                                    metafield_delivery_status: {
                                        $in: [
                                            'Z-Replacement Successful',
                                            'Z-Reverse Successful',
                                            'A-Delivery Failed (CNR)',
                                            'A-Delivery failed (Rescheduled)',
                                            'Z-Delivery Failed (customer cancelled)',
                                            'A-Delivery Failed (rider side)'
                                        ]
                                    },
                                    'Delivery_Status': 'Delivered'
                                }
                            ]
                        },
                        {
                            'Delivery_Status': 'Delivered'
                        }
                    ]
                }

            ]
        }).distinct('Driver Name');

        const ridersWithCounts = await Promise.all(riders.map(async (driverName) => {
            const productCount = await Route.aggregate([
                {
                    $match: {
                        'Driver Name': driverName,
                        seller_name,
                        $or: [
                            // Special case for 'Delivery Failed'
                            {
                                metafield_order_type: 'Delivery Failed',
                                'Delivery_Status': 'Delivered'
                            },
                            // Existing logic for 'Replacement' and 'Reverse Pickup'
                            {
                                $and: [
                                    {
                                        $or: [
                                            {
                                                metafield_order_type: { $in: ['Replacement', 'Reverse Pickup'] },
                                                metafield_delivery_status: {
                                                    $in: [
                                                        'Z-Replacement Successful',
                                                        'Z-Reverse Successful',
                                                        'A-Delivery Failed (CNR)',
                                                        'A-Delivery failed (Rescheduled)',
                                                        'Z-Delivery Failed (customer cancelled)',
                                                        'A-Delivery Failed (rider side)'
                                                    ]
                                                },
                                                'Delivery_Status': 'Delivered'
                                            },
                                            {
                                                metafield_order_type: { $exists: false }, // Handles cases where metafield_order_type is missing
                                                metafield_delivery_status: {
                                                    $in: [
                                                        'Z-Replacement Successful',
                                                        'Z-Reverse Successful',
                                                        'A-Delivery Failed (CNR)',
                                                        'A-Delivery failed (Rescheduled)',
                                                        'Z-Delivery Failed (customer cancelled)',
                                                        'A-Delivery Failed (rider side)'
                                                    ]
                                                },
                                                'Delivery_Status': 'Delivered'
                                            }
                                        ]
                                    },
                                    {
                                        'Delivery_Status': 'Delivered'
                                    }
                                ]
                            }

                        ]
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
};

const driversBySellerNameReversePickupSellersNotDelivered = async (req, res) => {
    const { seller_name } = req.params;
    //console.log(`Fetching riders for seller: ${seller_name}`);

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // // Check each collection for the seller's name
        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // // Dynamically set the collection for the Route model
        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

        // Find the distinct riders (drivers) for the given seller, order types, and delivery status
        const riders = await Route.find({
            seller_name,
            $or: [
                // Special case for 'Delivery Failed'
                {
                    metafield_order_type: 'Delivery Failed',
                    'Delivery_Status': 'Not Delivered'
                },
                // Existing logic for 'Replacement' and 'Reverse Pickup'
                {
                    $and: [
                        {
                            $or: [
                                {
                                    metafield_order_type: { $in: ['Replacement', 'Reverse Pickup'] },
                                    metafield_delivery_status: {
                                        $in: [
                                            'Z-Replacement Successful',
                                            'Z-Reverse Successful',
                                            'A-Delivery Failed (CNR)',
                                            'A-Delivery failed (Rescheduled)',
                                            'Z-Delivery Failed (customer cancelled)',
                                            'A-Delivery Failed (rider side)'
                                        ]
                                    },
                                    'Delivery_Status': 'Not Delivered'
                                },
                                {
                                    metafield_order_type: { $exists: false }, // Handles cases where metafield_order_type is missing
                                    metafield_delivery_status: {
                                        $in: [
                                            'Z-Replacement Successful',
                                            'Z-Reverse Successful',
                                            'A-Delivery Failed (CNR)',
                                            'A-Delivery failed (Rescheduled)',
                                            'Z-Delivery Failed (customer cancelled)',
                                            'A-Delivery Failed (rider side)'
                                        ]
                                    },
                                    'Delivery_Status': 'Not Delivered'
                                }
                            ]
                        },
                        {
                            'Delivery_Status': 'Not Delivered'
                        }
                    ]
                }

            ]
        }).distinct('Driver Name');

        const ridersWithCounts = await Promise.all(riders.map(async (driverName) => {
            const productCount = await Route.aggregate([
                {
                    $match: {
                        'Driver Name': driverName,
                        seller_name,
                        $or: [
                            // Special case for 'Delivery Failed'
                            {
                                metafield_order_type: 'Delivery Failed',
                                'Delivery_Status': 'Not Delivered'
                            },
                            // Existing logic for 'Replacement' and 'Reverse Pickup'
                            {
                                $and: [
                                    {
                                        $or: [
                                            {
                                                metafield_order_type: { $in: ['Replacement', 'Reverse Pickup'] },
                                                metafield_delivery_status: {
                                                    $in: [
                                                        'Z-Replacement Successful',
                                                        'Z-Reverse Successful',
                                                        'A-Delivery Failed (CNR)',
                                                        'A-Delivery failed (Rescheduled)',
                                                        'Z-Delivery Failed (customer cancelled)',
                                                        'A-Delivery Failed (rider side)'
                                                    ]
                                                },
                                                'Delivery_Status': 'Not Delivered'
                                            },
                                            {
                                                metafield_order_type: { $exists: false }, // Handles cases where metafield_order_type is missing
                                                metafield_delivery_status: {
                                                    $in: [
                                                        'Z-Replacement Successful',
                                                        'Z-Reverse Successful',
                                                        'A-Delivery Failed (CNR)',
                                                        'A-Delivery failed (Rescheduled)',
                                                        'Z-Delivery Failed (customer cancelled)',
                                                        'A-Delivery Failed (rider side)'
                                                    ]
                                                },
                                                'Delivery_Status': 'Not Delivered'
                                            }
                                        ]
                                    },
                                    {
                                        'Delivery_Status': 'Not Delivered'
                                    }
                                ]
                            }

                        ]
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
};

const productsBySellerName = async (req, res) => {
    const { seller_name } = req.params;

    try {
        const products = await Product.find({ seller_name: seller_name });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const productsById = async (req, res) => {
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
}

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

const notPickedProducts = async (req, res) => {
    const { seller_name, rider_code } = req.query;

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

        const query = {
            seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
            Pickup_Status: 'Not Picked',  // Add condition for Pickup_Status being 'Not Picked'
            $or: [
                { metafield_order_type: 'Replacement' },
                { metafield_order_type: { $eq: null } },
                { metafield_order_type: { $eq: '' } }
            ]
        };

        if (rider_code !== 'all') {
            query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
        }

        const filteredData = await Route.find(query)
            .select('FINAL line_item_sku line_item_name total_item_quantity line_item_quantity GMV line_item_price Pickup_Status bin')
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
            line_item_quantity: data.line_item_quantity,
            line_item_price: data.line_item_price,
            Pickup_Status: data.Pickup_Status,
            GMV: data.GMV,
            bin: data.bin
        }));

        res.json({ orderCodeQuantities, products });
    } catch (error) {
        console.error('Error fetching picked products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const pickedProducts = async (req, res) => {
    const { seller_name, rider_code } = req.query;

    //console.log('Query Params:', { seller_name, rider_code }); // Debugging

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   console.log('Seller not found'); // Debugging
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // console.log('Matching Collection Name:', matchingCollectionName); // Debugging

        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

        const query = {
            seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
            Pickup_Status: 'Picked',  // Add condition for Pickup_Status being 'Picked'
            $or: [
                { metafield_order_type: 'Replacement' },
                { metafield_order_type: { $eq: null } },
                { metafield_order_type: { $eq: '' } }
            ]
        };

        if (rider_code !== 'all') {
            query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
        }

        //console.log('Query:', query); // Debugging

        const filteredData = await Route.find(query)
            .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price Pickup_Status bin')
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
            GMV: data.GMV,
            bin: data.bin
        }));

        res.json({ orderCodeQuantities, products });
    } catch (error) {
        console.error('Error fetching picked products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const reversePickupProductsDelivered = async (req, res) => {
    const { seller_name, rider_code } = req.query;

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

        const query = {
            seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
            $or: [
                {
                    $and: [
                        { metafield_order_type: { $in: ['Reverse Pickup', 'Replacement', 'Delivery Failed'] } },
                        {
                            metafield_delivery_status: {
                                $in: [
                                    'Z-Replacement Successful',
                                    'Z-Reverse Successful',
                                    'A-Delivery Failed (CNR)',
                                    'A-Delivery failed (Rescheduled)',
                                    'Z-Delivery Failed (customer cancelled)',
                                    'A-Delivery Failed (rider side)'
                                ]
                            }
                        }
                    ]
                },
                {
                    $and: [
                        { metafield_order_type: { $in: [null, ''] } }, // Handles empty or null metafield_order_type
                        {
                            metafield_delivery_status: {
                                $in: [
                                    'Z-Replacement Successful',
                                    'Z-Reverse Successful',
                                    'A-Delivery Failed (CNR)',
                                    'A-Delivery failed (Rescheduled)',
                                    'Z-Delivery Failed (customer cancelled)',
                                    'A-Delivery Failed (rider side)'
                                ]
                            }
                        }
                    ]
                }
            ],
            Delivery_Status: 'Delivered' // Added filter for 'Delivered' status
        };

        if (rider_code !== 'all') {
            query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
        }

        const filteredData = await Route.find(query)
            .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price metafield_order_type Delivery_Status bin')
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
            GMV: data.GMV,
            bin: data.bin
        }));

        res.json({ orderCodeQuantities, products });
    } catch (error) {
        console.error('Error fetching picked products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const reversePickupProductsNotDelivered = async (req, res) => {
    const { seller_name, rider_code } = req.query;

    try {
        // const collections = await routeConnection.db.listCollections().toArray();
        // let matchingCollectionName;

        // for (const collection of collections) {
        //   const currentCollection = routeConnection.collection(collection.name);
        //   const foundSeller = await currentCollection.findOne({ seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') } });
        //   if (foundSeller) {
        //     matchingCollectionName = collection.name;
        //     break;
        //   }
        // }

        // if (!matchingCollectionName) {
        //   return res.status(404).json({ message: 'Seller not found in any collection' });
        // }

        // const Route = routeConnection.model('Route', require('./models/route').schema, matchingCollectionName);

        const query = {
            seller_name: { $regex: new RegExp(`^${seller_name}$`, 'i') },
            $or: [
                {
                    $and: [
                        { metafield_order_type: { $in: ['Reverse Pickup', 'Replacement', 'Delivery Failed'] } },
                        {
                            metafield_delivery_status: {
                                $in: [
                                    'Z-Replacement Successful',
                                    'Z-Reverse Successful',
                                    'A-Delivery Failed (CNR)',
                                    'A-Delivery failed (Rescheduled)',
                                    'Z-Delivery Failed (customer cancelled)',
                                    'A-Delivery Failed (rider side)'
                                ]
                            }
                        }
                    ]
                },
                {
                    $and: [
                        { metafield_order_type: { $in: [null, ''] } }, // Handles empty or null metafield_order_type
                        {
                            metafield_delivery_status: {
                                $in: [
                                    'Z-Replacement Successful',
                                    'Z-Reverse Successful',
                                    'A-Delivery Failed (CNR)',
                                    'A-Delivery failed (Rescheduled)',
                                    'Z-Delivery Failed (customer cancelled)',
                                    'A-Delivery Failed (rider side)'
                                ]
                            }
                        }
                    ]
                }
            ],
            Delivery_Status: 'Not Delivered' // Added filter for 'Delivered' status
        };

        if (rider_code !== 'all') {
            query["Driver Name"] = { $regex: new RegExp(`^${rider_code}$`, 'i') };
        }

        const filteredData = await Route.find(query)
            .select('FINAL line_item_sku line_item_name total_item_quantity GMV line_item_price metafield_order_type Delivery_Status bin')
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
            GMV: data.GMV,
            bin: data.bin
        }));

        res.json({ orderCodeQuantities, products });
    } catch (error) {
        console.error('Error fetching picked products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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

module.exports = {
    sellers,
    sellersBySellerNameAll,
    sellersBySellerNameDriversNotPicked,
    sellersBySellerNameDriversPicked,
    driversBySellerNameReversePickupSellers,
    driversBySellerNameReversePickupSellersNotDelivered,
    productsBySellerName,
    productsById,
    notPickedProducts,
    pickedProducts,
    reversePickupProductsDelivered,
    reversePickupProductsNotDelivered
};