import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import LazyImage from '../LazyImage';
import RefreshButton from './components/RefeshButton';

const ProductDetailsScreen = ({ route }) => {
  const { sellerName, riderCode } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderCodeQuantities, setOrderCodeQuantities] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://urvann-seller-panel-version.onrender.com/api/products', {
        params: {
          seller_name: sellerName,
          rider_code: riderCode !== 'all' ? riderCode : 'all',
        }
      });

      setProducts(response.data.products);
      setOrderCodeQuantities(response.data.orderCodeQuantities);
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
  }, [sellerName, riderCode]);

  const handleImagePress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderProduct = ({ item }) => {
    const pickupStatusColor = item.Pickup_Status === 'Picked' ? 'green' : 'red';

    return (
      <TouchableWithoutFeedback onPress={() => handleImagePress(item)}>
        <View style={styles.productContainer}>
          <LazyImage source={{ uri: item.image1 }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text>
              <Text style={styles.boldText}>SKU: </Text>{item.line_item_sku}
            </Text>
            <Text>
              <Text style={styles.boldText}>Name: </Text>{item.line_item_name}
            </Text>
            <Text>
              <Text style={styles.boldText}>Price: </Text>₹{item.line_item_price !== undefined ? item.line_item_price.toFixed(2) : 'N/A'}
            </Text>
            <Text>
              <Text style={styles.boldText}>Quantity: </Text>{item.total_item_quantity}
            </Text>
            <Text style={[styles.pickupStatusText, { color: pickupStatusColor }]}>
              {item.Pickup_Status}
            </Text>
          </View>
          <RefreshButton onRefresh={() => fetchProducts()} />
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
  const combinedProducts = {};
  products.forEach(product => {
    if (!combinedProducts[product.line_item_sku]) {
      combinedProducts[product.line_item_sku] = {
        ...product,
        total_item_quantity: 0
      };
    }
    combinedProducts[product.line_item_sku].total_item_quantity += product.total_item_quantity;
    combinedProducts[product.line_item_sku].Pickup_Status = ''; // Ensure pickup status is empty in combined list
  });

  // Convert combined products object to array
  const combinedProductsArray = Object.values(combinedProducts);

  const groupedProducts = {};
  products.forEach(product => {
    if (!groupedProducts[product['FINAL']]) {
      groupedProducts[product['FINAL']] = [];
    }
    groupedProducts[product['FINAL']].push(product);
  });

  const sortedFinalCodes = Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b));

  return (
    <View style={styles.container}>
      {riderCode === 'all' ? (
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
          {sortedFinalCodes.map(finalCode => (
            <ScrollView key={finalCode} contentContainerStyle={styles.scrollViewContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Order Code: {finalCode}</Text>
                <Text style={styles.subHeader}>Total Quantity: {orderCodeQuantities[finalCode]}</Text>
              </View>
              {groupedProducts[finalCode].map((product, index) => (
                <TouchableWithoutFeedback key={index} onPress={() => handleImagePress(product)}>
                  <View style={styles.productContainer}>
                    <LazyImage source={{ uri: product.image1 }} style={styles.image} />
                    <View style={styles.textContainer}>
                      <Text>
                        <Text style={styles.boldText}>SKU: </Text>{product.line_item_sku}
                      </Text>
                      <Text>
                        <Text style={styles.boldText}>Name: </Text>{product.line_item_name}
                      </Text>
                      <Text>
                        <Text style={styles.boldText}>Price: </Text>₹{product.line_item_price !== undefined ? product.line_item_price.toFixed(2) : 'N/A'}
                      </Text>
                      <Text>
                        <Text style={styles.boldText}>Quantity: </Text>{product.total_item_quantity}
                      </Text>
                      <Text style={[styles.pickupStatusText, { color: product.Pickup_Status === 'Picked' ? 'green' : 'red' }]}>
                        {product.Pickup_Status}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </ScrollView>
          ))}
        </Swiper>
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Text style={styles.modalText}>SKU: {selectedProduct.line_item_sku}</Text>
                <Text style={styles.modalText}>Name: {selectedProduct.line_item_name}</Text>
                <Text style={styles.modalText}>Price: ₹{selectedProduct.line_item_price !== undefined ? selectedProduct.line_item_price.toFixed(2) : 'N/A'}</Text>
                <Text style={styles.modalText}>Quantity: {selectedProduct.total_item_quantity}</Text>
                <Text style={[styles.pickupStatusText, { color: selectedProduct.Pickup_Status === 'Picked' ? 'green' : 'red' }]}>
                  {selectedProduct.Pickup_Status}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
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
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginRight: 15,
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
    marginTop: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default ProductDetailsScreen;
