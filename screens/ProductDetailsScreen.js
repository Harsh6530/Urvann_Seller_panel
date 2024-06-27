import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';

const ProductDetailsScreen = ({ route }) => {
  const { sellerName, riderCode } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderCodeQuantities, setOrderCodeQuantities] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://13.233.47.216:5001/api/products', {
          params: {
            seller_name: sellerName,
            rider_code: riderCode
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Group products by Final code
  const groupedProducts = {};
  products.forEach(product => {
    if (!groupedProducts[product['FINAL']]) {
      groupedProducts[product['FINAL']] = [];
    }
    groupedProducts[product['FINAL']].push(product);
  });

  // Sort the final codes in ascending order
  const sortedFinalCodes = Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b));

  return (
    <View style={styles.container}>
      <Swiper style={styles.wrapper} showsButtons loop={false}>
        {sortedFinalCodes.map(finalCode => (
          <ScrollView key={finalCode} contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.orderContainer}>
              <Text style={styles.header}>Order Code: {finalCode}</Text>
              <Text style={styles.subHeader}>Total Quantity: {orderCodeQuantities[finalCode]}</Text>
            </View>
            {groupedProducts[finalCode].map((product, index) => (
              <View key={index} style={styles.productContainer}>
                <Image source={{ uri: product.image1 }} style={styles.image} />
                <View style={styles.textContainer}>
                  <Text style={styles.text}>SKU: {product.line_item_sku}</Text>
                  <Text style={styles.text}>Name: {product.line_item_name}</Text>
                  <Text style={styles.text}>Quantity: {product.total_item_quantity}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ))}
      </Swiper>
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
  orderContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
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
});

export default ProductDetailsScreen;
