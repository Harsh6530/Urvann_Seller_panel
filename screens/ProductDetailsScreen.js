import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const ProductDetailsScreen = () => {
  const { params } = useRoute();
  const { sellerName, riderCode } = params;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`http://192.168.0.72:5000/api/products?seller_name=${sellerName}&rider_code=${riderCode}`)
      .then(response => setProducts(response.data))
      .catch(error => console.error(`Error fetching products for rider code ${riderCode} and seller ${sellerName}:`, error));
  }, [sellerName, riderCode]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products for {sellerName} - Rider Code {riderCode}:</Text>
      <FlatList
        data={products}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tile}>
            <Text style={styles.text}>SKU: {item.SKU}</Text>
            <Text style={styles.text}>Name: {item.Name}</Text>
            <Image source={{ uri: item.Photolink }} style={styles.image} resizeMode="contain" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tile: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
});

export default ProductDetailsScreen;
