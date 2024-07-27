import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import LazyImage from '../LazyImage';

const ProductDetailsScreen = ({ route }) => {
  const { sellerName, riderCode } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderCodeQuantities, setOrderCodeQuantities] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`https://urvann-seller-panel-yc3k.onrender.com/api/products`, {
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

    fetchProducts();
  }, [sellerName, riderCode]);

  const handleImagePress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Combine products and sort by GMV
  const combineListProducts = (products) => {
    const combined = products.reduce((acc, product) => {
      const existingProduct = acc.find(p => p.line_item_sku === product.line_item_sku);
      if (existingProduct) {
        existingProduct.total_item_quantity += product.total_item_quantity;
        existingProduct.GMV += product.GMV; // Ensure GMV is updated
      } else {
        acc.push({ ...product });
      }
      return acc;
    }, []);

    // Sort combined products by GMV in decreasing order
    return combined.sort((a, b) => b.GMV - a.GMV);
  };

  const combinedProducts = combineListProducts(products);

  const groupedProducts = {};
  products.forEach(product => {
    if (!groupedProducts[product['FINAL']]) {
      groupedProducts[product['FINAL']] = [];
    }
    groupedProducts[product['FINAL']].push(product);
  });

  const sortedFinalCodes = Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b));

  const renderProduct = ({ item }) => (
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
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <View style={styles.container}>
      {riderCode === 'all' ? (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Combined List</Text>
          </View>
          <FlatList
            data={combinedProducts}
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
  text: {
    fontSize: 16,
    marginBottom: 5,
    lineHeight: 20,
    color: '#333',
  },
  nameText: {
    fontSize: 16,
    marginBottom: 5,
    lineHeight: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  boldModalText: {
    fontWeight: 'bold',
  },
});

export default ProductDetailsScreen;
