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
            rider_code: riderCode !== 'all' ? riderCode : 'all'  // Ensure 'all' is passed correctly
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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Function to aggregate products by SKU for the combined list
  const aggregateProductsBySKU = (products) => {
    const productMap = {};
    products.forEach(product => {
      const sku = product.line_item_sku;
      if (productMap[sku]) {
        productMap[sku].total_item_quantity += product.total_item_quantity;
      } else {
        productMap[sku] = { ...product };
      }
    });
    return Object.values(productMap);
  };

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
          <Text style={styles.text}>SKU: {item.line_item_sku}</Text>
          <Text style={styles.text}>Name: {item.line_item_name}</Text>
          <Text style={styles.text}>Quantity: {item.total_item_quantity}</Text>
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
            data={aggregateProductsBySKU(products)}
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
                      <Text style={styles.text}>SKU: {product.line_item_sku}</Text>
                      <Text style={styles.text}>Name: {product.line_item_name}</Text>
                      <Text style={styles.text}>Quantity: {product.total_item_quantity}</Text>
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
                <Text style={styles.modalText}>SKU: {selectedProduct.line_item_sku}</Text>
                <Text style={styles.modalText}>Name: {selectedProduct.line_item_name}</Text>
                <Text style={styles.modalText}>Quantity: {selectedProduct.total_item_quantity}</Text>
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
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  wrapper: {},
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  subHeader: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
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
    marginTop: 10,
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default ProductDetailsScreen;
