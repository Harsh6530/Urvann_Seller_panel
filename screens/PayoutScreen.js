// PayoutScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PayoutScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Payout Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PayoutScreen;
