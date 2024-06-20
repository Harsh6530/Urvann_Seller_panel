import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper'; // Assuming you're using a swiper library

const ProductDetailsScreen = ({ route }) => {
  const { sellerName, riderCode } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://192.168.0.72:5000/api/products', {
          params: {
            seller_name: sellerName,
            rider_code: riderCode
          }
        });
        setProducts(response.data);
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

  // Group products by Order code
  const groupedProducts = {};
  products.forEach(product => {
    if (!groupedProducts[product['Order code']]) {
      groupedProducts[product['Order code']] = [];
    }
    groupedProducts[product['Order code']].push(product);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Product Details</Text>
      <Swiper style={styles.wrapper} showsButtons loop={false}>
        {Object.keys(groupedProducts).map(orderCode => (
          <ScrollView key={orderCode} contentContainerStyle={styles.scrollViewContainer}>
            {groupedProducts[orderCode].map((product, index) => (
              <View key={index} style={styles.productContainer}>
                <Image source={{ uri: product.Photolink }} style={styles.image} />
                <Text style={styles.text}>Order Code: {product['Order code']}</Text>
                <Text style={styles.text}>SKU: {product.SKU}</Text>
                <Text style={styles.text}>Name: {product.Name}</Text>
                <Text style={styles.text}>Quantity: {product.Quantity}</Text>
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
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  wrapper: {},
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  productContainer: {
    marginBottom: 20,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default ProductDetailsScreen;
