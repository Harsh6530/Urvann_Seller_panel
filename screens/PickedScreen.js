import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import RefreshButton from '../components/RefeshButton';

const PickedScreen = () => {
  const { params } = useRoute();
  const { sellerName } = params;
  const [ridersWithCounts, setRidersWithCounts] = useState([]);
  const [combinedProductCount, setCombinedProductCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`http://10.117.4.182:5001/api/sellers/${sellerName}/drivers/picked`)
      .then(response => {
        console.log('Riders with counts:', response.data); // Log the response data
        setRidersWithCounts(response.data);
      })
      .catch(error => console.error(`Error fetching rider codes for ${sellerName}:`, error));

    // Fetch combined product count with "Not Picked" status
    axios.get(`http://10.117.4.182:5001/api/sellers/${sellerName}/all?pickup_status=picked`)
      .then(response => {
        setCombinedProductCount(response.data.totalProductCount);
      })
      .catch(error => console.error(`Error fetching combined product count for ${sellerName}:`, error));
  }, [sellerName]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    axios.get(`http://10.117.4.182:5001/api/sellers/${sellerName}/drivers/picked`)
      .then(response => {
        console.log('Riders with counts:', response.data); // Log the response data
        setRidersWithCounts(response.data);
      })
      .catch(error => console.error(`Error fetching rider codes for ${sellerName}:`, error));

    // Fetch combined product count with "Not Picked" status
    axios.get(`http://10.117.4.182:5001/api/sellers/${sellerName}/all?pickup_status=picked`)
      .then(response => {
        setCombinedProductCount(response.data.totalProductCount);
      })
      .catch(error => console.error(`Error fetching combined product count for ${sellerName}:`, error));
    setRefreshing(false);
  };

  const handleRiderPress = (driverName) => {
    console.log('Navigating to ProductDetailsScreen with params:', {
      sellerName,
      driverName,
      pickupStatus: 'Picked'
    });
    navigation.navigate('ProductDetailsScreen', { sellerName, driverName, pickupStatus: 'Picked' });
  };

  const handleCombineListPress = () => {
    console.log('Navigating to ProductDetailsScreen with params:', {
      sellerName,
      driverName: 'all',
      pickupStatus: 'Picked'
    });
    navigation.navigate('ProductDetailsScreen', { sellerName, driverName: 'all', pickupStatus: 'Picked' });
  };

  return (
    <View style={styles.container}>
      {ridersWithCounts.length === 0 ? (
        <View style={styles.noItemsContainer}>
          <Text style={styles.noItemsText}>No items are picked!</Text>
          <RefreshButton onRefresh={handleRefresh} />
        </View>
      ) : (
        <FlatList
          data={ridersWithCounts}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleRiderPress(item.driverName)}>
              <View style={styles.tile}>
                <Text style={styles.productCount}>
                  {item.driverName}
                </Text>
                <Text style={styles.text}>
                  {item.productCount} {item.productCount === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListHeaderComponent={() => (
            <TouchableOpacity onPress={handleCombineListPress}>
              <View style={styles.combineListTile}>
                <Text style={styles.productCount}>Combined List</Text>
                <Text style={styles.text}>
                  {combinedProductCount} {combinedProductCount === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 20,
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
    elevation: 3,
  },
  combineListTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    elevation: 5,
    marginVertical: 10,
    backgroundColor: '#e0e0e0',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
  },
  noItemsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noItemsText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  productCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

export default PickedScreen;