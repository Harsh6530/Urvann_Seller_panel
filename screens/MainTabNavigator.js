import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import PayoutScreen from './PayoutScreen';
import DeliveryUpdatesScreen from './DeliveryUpdatesScreen';
import RiderCodesScreen from './RiderCodesScreen';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ navigation, route }) => {
  const sellerName = route?.params?.sellerName ?? 'defaultSellerName';

  const handleLogout = async () => {
    try {
      // Clear any async storage or context related to the user session
      await AsyncStorage.removeItem('userToken'); // Assuming you stored token as 'userToken'

      // Reset the navigation stack to prevent going back to the main screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'Unable to logout at this time. Please try again later.');
      // Handle any specific error case, e.g., retrying, showing an alert, etc.
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
          backgroundColor: '#287238', // Set header background color to green
        },
        headerTintColor: '#fff', // Set header text color
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
      <Tab.Screen name="Pickup" component={RiderCodesScreen} initialParams={{ sellerName }} />
      <Tab.Screen name="Delivery Updates" component={DeliveryUpdatesScreen} initialParams={{ sellerName }} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
