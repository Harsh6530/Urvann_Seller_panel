import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator, Image, RefreshControl } from 'react-native';
import axios from 'axios';
import RefreshButton from '../components/RefeshButton';

const PayableScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayables = async () => {
    try {
      const response = await axios.get(`http://10.117.4.182:5001/api/payable/${sellerName}`);
      setPayables(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payables:', error);
      setError(error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPayables();
  }, [sellerName]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayables();
    setRefreshing(false);
  };

  const renderPayableItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.order_id}</Text>
      <Text style={styles.cell}>{item.line_item_name}</Text>
      <Text style={styles.cell}>{item.line_item_price}</Text>
      <Text style={styles.cell}>{item.line_item_quantity}</Text>
      <Text style={styles.cell}>{item['Payable to vendor']}</Text>
      <Text style={styles.cell}>{item.SKU}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#287238" />
        <Text style={styles.loadingText}>Loading payables...</Text>
      </View>
    );
  }

  if (error || !payables.length) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.sadEmoji}>😔</Text>
          <Text style={styles.noDataText}>Oops! No payable data available for {sellerName}.</Text>
        </View>
        <RefreshButton onRefresh={() => fetchPayables()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Payables for {sellerName}</Text> */}
      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Order ID</Text>
            <Text style={styles.headerCell}>Line Item Name</Text>
            <Text style={styles.headerCell}>Line Item Price</Text>
            <Text style={styles.headerCell}>Line Item Quantity</Text>
            <Text style={styles.headerCell}>Payable to Vendor</Text>
            <Text style={styles.headerCell}>SKU</Text>
          </View>
          <FlatList
            data={payables}
            renderItem={renderPayableItem}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          />
        </View>
      </ScrollView>
      <RefreshButton onRefresh={() => fetchPayables()} />
    </View>
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
  noDataContainer: {
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
    width: 120, // Set a fixed width for all header cells
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
    width: 120, // Set a fixed width for all cells
    padding: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});

export default PayableScreen;
