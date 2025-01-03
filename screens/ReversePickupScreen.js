import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity,  } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import RefreshButton from '../components/RefeshButton';

const ReversePickupScreen = ({ route }) => {
  const [riders, setRiders] = useState([]);
  const navigation = useNavigation();
  const { sellerName } = route.params; // Extract sellerName from route params

  useEffect(() => {
    axios.get(`https://urvann-seller-panel-version.onrender.com/api/driver/${sellerName}/reverse-pickup-sellers`)
      .then(response => {
        setRiders(response.data);
      })
      .catch(error => console.error(`Error fetching reverse pickup riders for ${sellerName}:`, error));
  }, [sellerName]);

  const handleRefresh = async () => {
    axios.get(`https://urvann-seller-panel-version.onrender.com/api/driver/${sellerName}/reverse-pickup-sellers`)
      .then(response => {
        setRiders(response.data);
      })
      .catch(error => console.error(`Error fetching reverse pickup riders for ${sellerName}:`, error));
  }

  const handleRiderPress = (driverName) => {
    // Define the endpoint for the PickupDetails screen
    const endpoint = '/api/reverse-pickup-products';  // Adjust this endpoint as needed

    navigation.navigate('ReverseProductDetails', {
      sellerName,
      driverName,
      endpoint  // Pass the endpoint parameter
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={riders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tile}
            onPress={() => handleRiderPress(item.driverName)}
          >
            <Text style={styles.riderName}>
              {item.driverName}
            </Text>
            <Text style={styles.productCount}>
              {item.productCount} {item.productCount === 1 ? 'item' : 'items'}
            </Text>
          </TouchableOpacity>
        )}
      />
      <RefreshButton onRefresh={handleRefresh} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default ReversePickupScreen;