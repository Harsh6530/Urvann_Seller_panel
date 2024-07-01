import { API_BASE_URL } from '@env';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const RiderCodesScreen = () => {
  const { params } = useRoute();
  const { sellerName } = params;
  const [ridersWithCounts, setRidersWithCounts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`https://urvann-seller-panel-yc3k.onrender.com/api/sellers/${sellerName}/riders`)
      .then(response => setRidersWithCounts(response.data))
      .catch(error => console.error(`Error fetching rider codes for ${sellerName}:`, error));
  }, [sellerName]);

  const handleRiderPress = (riderCode) => {
    navigation.navigate('ProductDetails', { sellerName, riderCode });
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
      />
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
