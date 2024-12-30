import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SummaryScreen from './SummaryScreen';
import RefundScreen from './RefundScreen';
import PayableScreen from './PayableScreen';

const Tab = createMaterialTopTabNavigator();

const PayoutTabs = ({ sellerName }) => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#a9a9a9',
      tabBarStyle: { backgroundColor: '#287238' },
      tabBarIndicatorStyle: { backgroundColor: '#f8b314' },
      tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
      swipeEnabled: false, // Disabling swipe to change tabs
    }}
  >
    <Tab.Screen name="Summary" component={SummaryScreen} initialParams={{ sellerName }}  />
    <Tab.Screen name="Refund" component={RefundScreen} initialParams={{ sellerName }} />
    <Tab.Screen name="Payable" component={PayableScreen} initialParams={{ sellerName }} />
  </Tab.Navigator>
);

const PayoutScreen = ({ route }) => {
  const { sellerName } = route.params;

  return (
    <NavigationContainer independent={true}>
      <View style={styles.container}>
        <PayoutTabs sellerName={sellerName} />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#287238',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default PayoutScreen;