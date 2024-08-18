import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import RiderCodesPickedScreen from './RiderCodesPickedScreen';
import RiderCodesNotPickedScreen from './RiderCodesNotPickedScreen';
import ReversePickupScreen from './ReversePickupScreen';  // Import the ReversePickupScreen

const Tab = createMaterialTopTabNavigator();

const PickupNavigator = ({ route }) => {
  const { sellerName } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#ddd',
        tabBarStyle: {
          backgroundColor: '#287238',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="NotPicked" 
        component={RiderCodesNotPickedScreen} 
        initialParams={{ sellerName }} 
        options={{ tabBarLabel: 'Not Picked' }} 
      />
      
      <Tab.Screen 
        name="Picked" 
        component={RiderCodesPickedScreen} 
        initialParams={{ sellerName }} 
        options={{ tabBarLabel: 'Picked' }} 
      />

      <Tab.Screen 
        name="ReversePickup" 
        component={ReversePickupScreen} 
        initialParams={{ sellerName }} 
        options={{ tabBarLabel: 'Reverse Pickup' }} 
      />
      
    </Tab.Navigator>
  );
};

export default PickupNavigator;
