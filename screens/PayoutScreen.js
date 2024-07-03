import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PayoutScreen = ({ navigation }) => {
  const handleSummaryPress = () => {
    // Handle Summary button press
  };

  const handleRefundPress = () => {
    // Handle Refund button press
  };

  const handlePayablePress = () => {
    // Handle Payable button press
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleSummaryPress}>
        <Text style={styles.buttonText}>Summary</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleRefundPress}>
        <Text style={styles.buttonText}>Refund</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handlePayablePress}>
        <Text style={styles.buttonText}>Payable</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 5,
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%', // Ensure buttons take full width
    alignItems: 'left', // Center text horizontally
  },
  buttonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PayoutScreen;
