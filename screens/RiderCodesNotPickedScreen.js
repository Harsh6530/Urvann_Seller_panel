import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Button } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const RiderCodesNotPickedScreen = () => {
  const { params } = useRoute();
  const { sellerName } = params;
  const [ridersWithCounts, setRidersWithCounts] = useState([]);
  const [combinedProductCount, setCombinedProductCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`http://10.5.16.226:5001/api/sellers/${sellerName}/drivers/not-picked`)
      .then(response => {
        setRidersWithCounts(response.data);
      })
      .catch(error => console.error(`Error fetching rider codes for ${sellerName}:`, error));
    
    // Fetch combined product count with "Not Picked" status
    axios.get(`http://10.5.16.226:5001/api/sellers/${sellerName}/all?pickup_status=not-picked`)
      .then(response => {
        setCombinedProductCount(response.data.totalProductCount);
      })
      .catch(error => console.error(`Error fetching combined product count for ${sellerName}:`, error));
  }, [sellerName]);
  
  const handleRiderPress = (driverName) => {
    navigation.navigate('ProductDetails', { sellerName, driverName, pickupStatus: 'Not Picked' });
  };

  const handleCombineListPress = () => {
    navigation.navigate('ProductDetails', { sellerName, driverName: 'all', pickupStatus: 'Not Picked' });
  };

  return (
    <View style={styles.container}>
      {ridersWithCounts.length === 0 ? (
        <View style={styles.noItemsContainer}>
          <Text style={styles.noItemsText}>All items are picked!</Text>
        </View>
      ) : (
        <FlatList
          data={ridersWithCounts}
          keyExtractor={(item, index) => index.toString()}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
  combineListTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
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
    fontSize: 22,
    //fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
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

export default RiderCodesNotPickedScreen;