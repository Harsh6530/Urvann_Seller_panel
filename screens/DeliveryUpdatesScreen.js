import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const DeliveryUpdatesScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [deliveryUpdates, setDeliveryUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveryUpdates = async () => {
      try {
        const response = await axios.get(`https://urvann-seller-panel-yc3k.onrender.com/api/data/${sellerName}`);
        setDeliveryUpdates(response.data.deliveryUpdates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching delivery updates:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchDeliveryUpdates();
  }, [sellerName]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{new Date(item.Date).toLocaleDateString()}</Text>
      <Text style={styles.cell}>{item.Delivered}</Text>
      <Text style={styles.cell}>{item.Penalty}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#287238" />
        <Text style={styles.loadingText}>Loading delivery updates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading delivery updates. Please try again later.</Text>
      </View>
    );
  }

  if (deliveryUpdates.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataEmoji}>😔</Text>
        <Text style={styles.noDataText}>Oops! No delivery updates available for {sellerName}.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal>
      <View style={styles.container}>
        <Text style={styles.title}>Delivery Updates for {sellerName}</Text>
        <View>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Delivered</Text>
            <Text style={styles.headerCell}>Penalty</Text>
          </View>
          <FlatList
            data={deliveryUpdates}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  noDataEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    width: 115, // Set a fixed width for all header cells
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    width: 115, // Set a fixed width for all cells
    padding: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});

export default DeliveryUpdatesScreen;
