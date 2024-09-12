import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator,  } from 'react-native';
import axios from 'axios';
import RefreshButton from '../components/RefeshButton';

const RefundScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRefunds = async () => {
    try {
      const response = await axios.get(`https://urvann-seller-panel-version.onrender.com/api/refund/${sellerName}`);
      setRefunds(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setError('Error loading refund data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [sellerName]);

  const renderRefundItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.order_id}</Text>
      <Text style={styles.cell}>{item['SKU id']}</Text>
      <Text style={styles.cell}>{item.line_item_name}</Text>
      <Text style={styles.cell}>{item['Product amount']}</Text>
      <Text style={styles.cell}>{item.Qty}</Text>
      <Text style={styles.cell}>{item['Amount to be deducted']}</Text>
      <Text style={styles.cell}>{item['B2B price']}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#287238" />
        <Text style={styles.loadingText}>Loading refunds...</Text>
      </View>
    );
  }

  if (error || refunds.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.sadEmoji}>😔</Text>
          <Text style={styles.noDataText}>Oops! No refund data available for {sellerName}.</Text>
        </View>
        <RefreshButton onRefresh={fetchRefunds} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Order ID</Text>
            <Text style={styles.headerCell}>SKU ID</Text>
            <Text style={styles.headerCell}>Product Name</Text>
            <Text style={styles.headerCell}>Product Amount</Text>
            <Text style={styles.headerCell}>Quantity</Text>
            <Text style={styles.headerCell}>Amount to Deduct</Text>
            <Text style={styles.headerCell}>B2B Price</Text>
          </View>
          <FlatList
            data={refunds}
            renderItem={renderRefundItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </ScrollView>
      <RefreshButton onRefresh={fetchRefunds} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    //backgroundColor: '#f9f9f9',
  },
  sadEmoji: {
    fontSize: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    width: 100, // Set a fixed width for all header cells
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    padding: 10,
  },
  cell: {
    width: 100, // Set a fixed width for all cells
    textAlign: 'center',
  },
});

export default RefundScreen;
