import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity,  } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useRoute
import RefreshButton from '../components/RefeshButton';

const NotDeliveredScreen = () => {
  const [riders, setRiders] = useState([]);
  const [error, setError] = useState(null); // State for error handling
  const navigation = useNavigation();
  const route = useRoute(); // Get route from useRoute hook
  const { sellerName } = route.params || {}; // Extract sellerName from route params

  useEffect(() => {
    if (sellerName) {
      // Fetch data from API
      axios.get(`http://10.117.4.182:5001/api/driver/${sellerName}/reverse-pickup-sellers-not-delivered`)
        .then(response => {
          setRiders(response.data);
        })
        .catch(error => {
          console.error(`Error fetching not delivered reverse pickup riders for ${sellerName}:`, error);
          setError('Failed to load data. Please try again later.'); // Set error message
        });
    }
  }, [sellerName]);
  
 
  const handleRefresh = async () => {
    if (sellerName) {
      // Fetch data from API
      axios.get(`http://10.117.4.182:5001/api/driver/${sellerName}/reverse-pickup-sellers-not-delivered`)
        .then(response => {
          setRiders(response.data);
        })
        .catch(error => {
          console.error(`Error fetching not delivered reverse pickup riders for ${sellerName}:`, error);
          setError('Failed to load data. Please try again later.'); // Set error message
        });
    }
  };

  const handleRiderPress = (driverName) => {
    // Define the endpoint for the PickupDetails screen
    const endpoint = '/api/reverse-pickup-products-not-delivered';  // Adjust this endpoint as needed
  
    navigation.navigate('ReverseNotDelieveredScreen', {
      sellerName,
      driverName,
      endpoint,
      previousScreen: 'NotDeliveredScreen'
    });
  };

  // Render loading or error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <RefreshButton onRefresh={handleRefresh} />
      </View>
    );
  }

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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotDeliveredScreen;