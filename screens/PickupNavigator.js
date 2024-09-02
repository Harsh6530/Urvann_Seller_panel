import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import InternalPickupTabNavigator from './InternalPickupTabNavigator';  // The navigator you created earlier
import InternalReturnsTabNavigator from './InternalReturnsTabNavigator';  // The new navigator

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
        name="PickupTab" 
        component={InternalPickupTabNavigator} 
        initialParams={{ sellerName }} 
        options={{ tabBarLabel: 'Pickup' }} 
      />
      
      <Tab.Screen 
        name="Returns" 
        component={InternalReturnsTabNavigator} 
        initialParams={{ sellerName }} 
        options={{ tabBarLabel: 'Returns' }} 
      />
    </Tab.Navigator>
  );
};

export default PickupNavigator;