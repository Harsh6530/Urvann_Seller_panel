import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SellerTiles = () => {
  const [sellers, setSellers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get('http://192.168.0.72:5000/api/sellers')
      .then(response => setSellers(response.data))
      .catch(error => console.error('Error fetching sellers:', error));
  }, []);

  const handleSellerPress = (sellerName) => {
    navigation.navigate('RiderCodes', { sellerName });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sellers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSellerPress(item)}>
            <View style={styles.tile}>
              <Text style={styles.text}>{item}</Text>
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
    paddingTop: 40,
  },
  tile: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

export default SellerTiles;
