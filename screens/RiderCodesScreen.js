import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import axios from 'axios';

const RiderCodesScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [riderCodes, setRiderCodes] = useState([]);

  useEffect(() => {
    axios.get(`http://192.168.0.72:5000/api/sellers/${sellerName}/riders`)
      .then(response => setRiderCodes(response.data))
      .catch(error => console.error(`Error fetching riders for ${sellerName}:`, error));
  }, [sellerName]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rider Codes for {sellerName}:</Text>
      <FlatList
        data={riderCodes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.riderTile}>
            <Text style={styles.text}>{item}</Text>
          </View>
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
  riderTile: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

export default RiderCodesScreen;
