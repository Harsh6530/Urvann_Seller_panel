import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import PayoutScreen from './PayoutScreen';
import DeliveryUpdatesScreen from './DeliveryUpdatesScreen';
import PickupNavigator from './PickupNavigator';
import ProductDetailsNavigator from './ProductDetailsNavigator'; // Import the correctly set up PickupNavigator
import { TouchableOpacity, Text, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ navigation, route }) => {
  const sellerName = route?.params?.sellerName ?? 'defaultSellerName';

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Assuming you stored token as 'userToken'
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'Unable to logout at this time. Please try again later.');
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Payout') {
            iconName = 'cash';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Pickup') {
            iconName = 'truck-delivery';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Delivery Updates') {
            iconName = 'clipboard-list';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Product Details') {
            iconName = 'document-text'; // Choose an icon for Product Details
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#287238',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#f9f9f9',
          borderTopWidth: 1,
          borderTopColor: '#ccc',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: '#287238',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 10 }} onPress={handleLogout}>
            <Text style={{ color: 'white', fontSize: 19 }}>Logout</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Payout" component={PayoutScreen} initialParams={{ sellerName }} />
      <Tab.Screen name="Pickup" component={PickupNavigator} initialParams={{ sellerName }} /> 
      <Tab.Screen name="Delivery Updates" component={DeliveryUpdatesScreen} initialParams={{ sellerName }} />
      <Tab.Screen name="Product Details" component={ProductDetailsNavigator} initialParams={{ sellerName }} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;