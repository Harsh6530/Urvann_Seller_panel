import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const RiderCodesScreen = () => {
  const { params } = useRoute();
  const { sellerName } = params;
  const [riderCodes, setRiderCodes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`http://192.168.0.72:5000/api/sellers/${sellerName}/riders`)
      .then(response => setRiderCodes(response.data))
      .catch(error => console.error(`Error fetching rider codes for ${sellerName}:`, error));
  }, [sellerName]);

  const handleRiderPress = (riderCode) => {
    navigation.navigate('ProductDetails', { sellerName, riderCode });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rider Codes for {sellerName}:</Text>
      <FlatList
        data={riderCodes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleRiderPress(item)}>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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

export default RiderCodesScreen;
