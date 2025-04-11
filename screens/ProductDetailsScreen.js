import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Modal, TouchableWithoutFeedback, ScrollView,  } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import LazyImage from '../LazyImage';
import RefreshButton from '../components/RefeshButton';

const ProductDetailsScreen = ({ route }) => {
  const { sellerName, driverName, pickupStatus } = route.params;  // Accept the new parameter
  const [products, setProducts] = useState([]);  // Default to an empty array
  const [loading, setLoading] = useState(true);
  const [orderCodeQuantities, setOrderCodeQuantities] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      console.log('Seller Name:', sellerName);
      console.log('Driver Name:', driverName);
      const endpoint = pickupStatus === 'Picked'
        ? 'https://urvann-seller-panel-version.onrender.com/api/picked-products'
        : 'https://urvann-seller-panel-version.onrender.com/api/not-picked-products';

      const response = await axios.get(endpoint, {
        params: {
          seller_name: sellerName,
          rider_code: driverName !== 'all' ? driverName : 'all',
        }
      });

      // Ensure that response.data.products is an array
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
      setOrderCodeQuantities(response.data.orderCodeQuantities || {});
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const intervalId = setInterval(() => {
      fetchProducts();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [sellerName, driverName, pickupStatus]);

  const handleRefresh = async () => {
    await fetchProducts();
  };

  const handleImagePress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  //for the combined list
  const renderProduct = ({ item }) => {
    const pickupStatusColor = item.Pickup_Status === 'Picked' ? 'green' : 'red';
    const totalPrice = item.line_item_price * item.line_item_quantity; // Calculate total price
  
    return (
      <TouchableWithoutFeedback onPress={() => handleImagePress(item)}>
        <View style={styles.productContainer}>
          <LazyImage source={{ uri: item.image1 }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text>
              <Text style={styles.boldText}>SKU: </Text>{item.line_item_sku}
            </Text>
            {/* Show bin only if it is available */}
            {item.bin && (
              <Text>
                <Text style={styles.boldText}>bin: </Text>{item.bin}
              </Text>
            )}
            <Text>
              <Text style={styles.boldText}>Name: </Text>{item.line_item_name}
            </Text>
            <Text>
              <Text style={styles.boldText}>Price per product: </Text>₹{item.line_item_price !== undefined ? item.line_item_price.toFixed(2) : 'N/A'}
            </Text>
            <Text>
              <Text style={styles.boldText}>Quantity: </Text>{item.total_item_quantity}
            </Text>
            <Text>
              <Text style={styles.boldText}>Total Price: </Text>₹{totalPrice.toFixed(2)} {/* Display total price */}
            </Text>
            <Text style={[styles.pickupStatusText, { color: pickupStatusColor }]}>
              {item.Pickup_Status}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Process products to group by SKU and sum up quantities for the combined list
  // Process products to group by SKU and sum up quantities for the combined list
// Process products to group by SKU and sum up quantities for the combined list
const combinedProducts = {};
products.forEach(product => {
  const sku = product.line_item_sku;

  // Initialize the product group if not present
  if (!combinedProducts[sku]) {
    combinedProducts[sku] = {
      ...product,
      total_item_quantity: 0,
      bin: product.bin || '', // Use the bin value if available, otherwise set to an empty string
    };
  }

  // Accumulate the total quantity
  combinedProducts[sku].total_item_quantity += product.total_item_quantity;

  // Ensure that the `bin` value remains consistent; if it was set initially, don't override it
  if (!combinedProducts[sku].bin && product.bin) {
    combinedProducts[sku].bin = product.bin;
  }

  // Pickup status remains empty in the combined list
  combinedProducts[sku].Pickup_Status = '';
});

// Convert combined products object to array
const combinedProductsArray = Object.values(combinedProducts);

// Updated Sorting Logic
combinedProductsArray.sort((a, b) => {
  const binA = a.bin ? Number(a.bin) : null; // Convert to number or set to null if undefined
  const binB = b.bin ? Number(b.bin) : null; // Convert to number or set to null if undefined

  // Sort by bin value first (ascending)
  if (binA !== null && binB !== null) {
    return binA - binB; // Numeric comparison for bins
  }

  // If one has a null bin value, place it after the one with a non-null bin value
  if (binA === null && binB !== null) return 1;
  if (binA !== null && binB === null) return -1;

  // If both bins are null, sort by total_item_quantity (descending)
  return b.total_item_quantity - a.total_item_quantity;
});

const groupedProducts = {};
  products.forEach(product => {
    if (!groupedProducts[product['FINAL']]) {
      groupedProducts[product['FINAL']] = [];
    }
    groupedProducts[product['FINAL']].push(product);
  });

  const sortedFinalCodes = Object.keys(groupedProducts).sort((a, b) => {
    // Get the first product of each group to compare bins
    const firstProductA = groupedProducts[a][0];
    const firstProductB = groupedProducts[b][0];
  
    const binA = firstProductA.bin ? Number(firstProductA.bin) : null;
    const binB = firstProductB.bin ? Number(firstProductB.bin) : null;
  
    // Sort by bin value first (ascending)
    if (binA !== null && binB !== null) {
      return binA - binB;
    }
  
    // If one has a null bin value, place it after the one with a non-null bin value
    if (binA === null && binB !== null) return 1;
    if (binA !== null && binB === null) return -1;
  
    // If both bins are null, sort by total_item_quantity (descending)
    const totalQuantityA = groupedProducts[a].reduce((sum, product) => sum + product.total_item_quantity, 0);
    const totalQuantityB = groupedProducts[b].reduce((sum, product) => sum + product.total_item_quantity, 0);
  
    return totalQuantityB - totalQuantityA;
  });
  

  return (
    <View style={styles.container}>
      {driverName === 'all' ? (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Combined List</Text>
          </View>
          <FlatList
            data={combinedProductsArray}
            renderItem={renderProduct}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.scrollViewContainer}
          />
        </>
      ) : (
        <Swiper style={styles.wrapper} showsButtons loop={false}>
          {sortedFinalCodes.map(finalCode => {
            // Sort products inside each order code group using the same logic
            const sortedProducts = groupedProducts[finalCode].sort((a, b) => {
              const binA = a.bin ? Number(a.bin) : null;
              const binB = b.bin ? Number(b.bin) : null;

              // Sort by bin value first (ascending)
              if (binA !== null && binB !== null) {
                return binA - binB;
              }

              // If one has a null bin value, place it after the one with a non-null bin value
              if (binA === null && binB !== null) return 1;
              if (binA !== null && binB === null) return -1;

              // If both bins are null, sort by total_item_quantity (descending)
              return b.total_item_quantity - a.total_item_quantity;
            });

            return (
              <ScrollView key={finalCode} contentContainerStyle={styles.scrollViewContainer}>
                <View
                  style={[
                    styles.headerContainer,
                    (finalCode.includes('VIP') || finalCode.includes('VVIP')) && styles.vipContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.header,
                      (finalCode.includes('VIP') || finalCode.includes('VVIP')) && styles.vipText,
                    ]}
                  >
                    Order Code: {finalCode}
                  </Text>
                  <Text style={styles.subHeader}>Total Quantity: {orderCodeQuantities[finalCode]}</Text>
                </View>
                {sortedProducts.map((product, index) => (
                  <TouchableWithoutFeedback key={index} onPress={() => handleImagePress(product)}>
                    <View style={styles.productContainer}>
                      <LazyImage source={{ uri: product.image1 }} style={styles.image} />
                      <View style={styles.textContainer}>
                        <Text>
                          <Text style={styles.boldText}>SKU: </Text>{product.line_item_sku}
                        </Text>
                        {product.bin && (
                          <Text>
                            <Text style={styles.boldText}>Bin: </Text>{product.bin}
                          </Text>
                        )}
                        <Text>
                          <Text style={styles.boldText}>Name: </Text>{product.line_item_name}
                        </Text>
                        <Text>
                          <Text style={styles.boldText}>Price per product: </Text>₹
                          {product.line_item_price !== undefined ? product.line_item_price.toFixed(2) : 'N/A'}
                        </Text>
                        <Text>
                          <Text style={styles.boldText}>Quantity: </Text>{product.total_item_quantity}
                        </Text>
                        <Text>
                          <Text style={styles.boldText}>Total Price: </Text>₹
                          {(product.line_item_price * product.line_item_quantity).toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.pickupStatusText,
                            { color: product.Pickup_Status === 'Picked' ? 'green' : 'red' },
                          ]}
                        >
                          {product.Pickup_Status}
                        </Text>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                ))}
              </ScrollView>


            );
          })}
        </Swiper>
      )}

      {selectedProduct && (
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <LazyImage source={{ uri: selectedProduct.image1 }} style={styles.fullScreenImage} />
                <Text style={styles.modalText}>
                  <Text style={styles.boldModalText}>SKU: </Text>{selectedProduct.line_item_sku}
                </Text>
                {selectedProduct.bin && (
                  <Text style={styles.modalText}>
                    <Text style={styles.boldModalText}>bin: </Text>{selectedProduct.bin}
                  </Text>
                )}
                <Text style={styles.modalText}>
                  <Text style={styles.boldModalText}>Name: </Text>{selectedProduct.line_item_name}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.boldModalText}>Price per product: </Text>₹{selectedProduct.line_item_price !== undefined ? selectedProduct.line_item_price.toFixed(2) : 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.boldModalText}>Quantity: </Text>{selectedProduct.total_item_quantity}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.boldModalText}>Total Price: </Text>₹
                  {(selectedProduct.line_item_price * selectedProduct.line_item_quantity).toFixed(2)}
                </Text>
                {/* <Text style={[styles.statusText, selectedProduct.Pickup_Status === "Picked" ? styles.pickedStatus : styles.notPickedStatus]}>
                  {selectedProduct.Pickup_Status}
                </Text> */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      <RefreshButton onRefresh={handleRefresh} />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 20,
  },
  wrapper: {},
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#f0f4f8',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subHeader: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 5,
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#ffffff',
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  vipContainer: {
    borderColor: '#ff0000', // Border color for VIP/VVIP
    borderWidth: 2, // Thicker border for emphasis
  },
  vipText: {
    color: '#ff0000', // Change the text color to Red
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginRight: 8,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  pickupStatusText: {
    // marginTop: 2,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  fullScreenImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  boldModalText: {
    fontWeight: 'bold',
  },
});

export default ProductDetailsScreen;