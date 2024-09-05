import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Button,  } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import RefreshButton from './components/RefreshButton';

const RiderCodesScreen = () => {
  const { params } = useRoute();
  const { sellerName } = params;
  const [ridersWithCounts, setRidersWithCounts] = useState([]);
  const [combinedProductCount, setCombinedProductCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`http://10.117.4.182:5001/api/sellers/${sellerName}/riders`)
      .then(response => {
        setRidersWithCounts(response.data);
      })
      .catch(error => console.error(`Error fetching rider codes for ${sellerName}:`, error));

    axios.get(`http://10.117.4.182:5001/api/sellers/${sellerName}/all`)
      .then(response => {
        setCombinedProductCount(response.data.totalProductCount);
      })
      .catch(error => console.error(`Error fetching combined product count for ${sellerName}:`, error));
  }, [sellerName]);

  const handleRefresh = async () => {
    axios.get(`http://10.117.4.182:5001/api/sellers/${sellerName}/riders`)
      .then(response => {
        setRidersWithCounts(response.data);
      })
      .catch(error => console.error(`Error fetching rider codes for ${sellerName}:`, error));

    axios.get(`http://10.117.4.182:5001/api/sellers/${sellerName}/all`)
      .then(response => {
        setCombinedProductCount(response.data.totalProductCount);
      })
      .catch(error => console.error(`Error fetching combined product count for ${sellerName}:`, error));
  };

  const handleRiderPress = (riderCode) => {
    navigation.navigate('ProductDetails', { sellerName, riderCode });
  };

  const handleCombineListPress = () => {
    navigation.navigate('ProductDetails', { sellerName, riderCode: 'all' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Riders for {sellerName}:</Text>
      <FlatList
        data={ridersWithCounts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleRiderPress(item.riderCode)}>
            <View style={styles.tile}>
              <Text style={styles.productCount}>
                {item.riderCode}
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
      <RefreshButton onRefresh={handleRefresh} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
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

export default RiderCodesScreen;