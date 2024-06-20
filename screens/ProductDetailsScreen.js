import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

const ProductDetailsScreen = ({ route }) => {
  const { sellerName, riderCode } = route.params;
  const [products, setProducts] = useState([]);
  const [orderCodeQuantities, setOrderCodeQuantities] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://192.168.89.221:5000/api/products', {
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

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <Text style={styles.header}>Product Details</Text>
      {Object.entries(orderCodeQuantities).map(([orderCode, quantity]) => (
        <View key={orderCode} style={styles.orderCodeContainer}>
          <Text style={styles.orderCodeText}>
            Order Code: {orderCode} - Total Quantity: {quantity}
          </Text>
          {products
            .filter(product => product['Order code'] === orderCode)
            .map((product, index) => (
              <View key={index} style={styles.productContainer}>
                <Image source={{ uri: product.Photolink }} style={styles.image} />
                <Text style={styles.text}>Order Code: {product['Order code']}</Text>
                <Text style={styles.text}>SKU: {product.SKU}</Text>
                <Text style={styles.text}>Name: {product.Name}</Text>
                <Text style={styles.text}>Quantity: {product.Quantity}</Text>
              </View>
            ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderCodeContainer: {
    width: '80%',
    marginBottom: 20,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  orderCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productContainer: {
    marginBottom: 20,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
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
