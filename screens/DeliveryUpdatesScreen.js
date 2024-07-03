import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const DeliveryUpdatesScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [deliveryUpdates, setDeliveryUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(`Fetching delivery updates for seller: ${sellerName}`); // Log sellerName
    const fetchDeliveryUpdates = async () => {
      try {
        const response = await axios.get(`http://192.168.0.51:5001/api/data/${sellerName}`);
        console.log('API response:', response.data); // Log API response
        setDeliveryUpdates(response.data.deliveryUpdates);
        setLoading(false); // Ensure loading state is updated
      } catch (error) {
        console.error('Error fetching delivery updates:', error);
        setError(error);
        setLoading(false); // Ensure loading state is updated
      }
    };
  
    fetchDeliveryUpdates();
  }, [sellerName]);
  

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading delivery updates.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Updates for {sellerName}</Text>
      {deliveryUpdates.length === 0 ? (
        <Text>No delivery updates available.</Text>
      ) : (
        deliveryUpdates.map((update, index) => (
          <View key={index} style={styles.updateContainer}>
            <Text>Date: {new Date(update.Date).toLocaleDateString()}</Text>
            <Text>Delivered: {update.Delivered}</Text>
            <Text>Penalty: {update.Penalty}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  updateContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default DeliveryUpdatesScreen;
