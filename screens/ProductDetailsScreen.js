import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import LazyImage from '../LazyImage'; // Ensure LazyImage is correctly imported
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductDetailsScreen = ({ route }) => {
  const { sellerName, riderCode } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderCodeQuantities, setOrderCodeQuantities] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Function to save pickup status locally
  const savePickupStatusLocally = async (sku, orderCode, status) => {
    try {
      await AsyncStorage.setItem(`${sku}_${orderCode}`, status);
    } catch (error) {
      console.error('Error saving pickup status:', error);
    }
  };

  // Function to load pickup status locally
  const loadPickupStatusLocally = async (sku, orderCode) => {
    try {
      const status = await AsyncStorage.getItem(`${sku}_${orderCode}`);
      return status || "Not Picked";
    } catch (error) {
      console.error('Error loading pickup status:', error);
      return "Not Picked";
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`https://urvann-seller-panel-yc3k.onrender.com/api/products`, {
        params: {
          seller_name: sellerName,
          rider_code: riderCode !== 'all' ? riderCode : 'all',
        }
      });

      const fetchedProducts = await Promise.all(response.data.products.map(async product => {
        const localStatus = await loadPickupStatusLocally(product.line_item_sku, product.FINAL);
        return {
          ...product,
          "Pickup Status": localStatus
        };
      }));

      setProducts(fetchedProducts);
      setOrderCodeQuantities(response.data.orderCodeQuantities);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Set up interval to refresh products every minute
    const intervalId = setInterval(() => {
      fetchProducts();
    }, 60000); // 60000 ms = 1 minute

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [sellerName, riderCode]);

  const handleImagePress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const toggleProductStatus = async (sku, orderCode) => {
    const updatedProducts = products.map(product => {
      if (product.line_item_sku === sku && product.FINAL === orderCode) {
        const newStatus = product["Pickup Status"] === "Not Picked" ? "Picked" : "Not Picked";
        return { ...product, "Pickup Status": newStatus };
      }
      return product;
    });

    setProducts(updatedProducts);

    try {
      const productToUpdate = updatedProducts.find(product => product.line_item_sku === sku && product.FINAL === orderCode);
      if (!productToUpdate) {
        console.error(`Product with SKU ${sku} and order code ${orderCode} not found.`);
        return;
      }
      const newStatus = productToUpdate["Pickup Status"];
      await axios.post('https://urvann-seller-panel-yc3k.onrender.com/api/update-pickup-status', {
        sku,
        orderCode,
        status: newStatus
      });

      await savePickupStatusLocally(sku, orderCode, newStatus);
    } catch (error) {
      console.error('Error updating pickup status:', error);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableWithoutFeedback onPress={() => toggleProductStatus(item.line_item_sku, item.FINAL)}>
      <View style={[styles.productContainer, item["Pickup Status"] === "Picked" ? styles.picked : styles.notPicked]}>
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
          {riderCode !== 'all' && (
            <Text style={[styles.statusText, item["Pickup Status"] === "Picked" ? styles.pickedStatus : styles.notPickedStatus]}>
              {item["Pickup Status"]}
            </Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

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
            data={products}
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
                      <Text style={[styles.statusText, product["Pickup Status"] === "Picked" ? styles.pickedStatus : styles.notPickedStatus]}>
                        {product["Pickup Status"]}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </ScrollView>
          ))}
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
                <Text style={styles.modalText}>
                  <Text style={styles.boldModalText}>Name: </Text>{selectedProduct.line_item_name}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.boldModalText}>Price: </Text>₹{selectedProduct.line_item_price !== undefined ? selectedProduct.line_item_price.toFixed(2) : 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.boldModalText}>Quantity: </Text>{selectedProduct.total_item_quantity}
                </Text>
                <Text style={[styles.statusText, selectedProduct["Pickup Status"] === "Picked" ? styles.pickedStatus : styles.notPickedStatus]}>
                  {selectedProduct["Pickup Status"]}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  wrapper: {
    height: '100%',
  },
  scrollViewContainer: {
    padding: 10,
  },
  headerContainer: {
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    color: '#555',
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  picked: {
    backgroundColor: '#d4edda',
  },
  notPicked: {
    backgroundColor: '#f8d7da',
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    marginTop: 5,
  },
  pickedStatus: {
    color: 'green',
  },
  notPickedStatus: {
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  boldModalText: {
    fontWeight: 'bold',
  },
});

export default ProductDetailsScreen;
