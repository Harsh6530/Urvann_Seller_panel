import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './screens/MainTabNavigator';
//import ProductDetailsScreen from './screens/ProductDetailsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RiderCodesScreen from './screens/RiderCodesScreen';
import ReverseDeliveredScreen from './screens/ReverseDeliveredScreen';
import ReverseNotDeliveredScreen from './screens/ReverseNotDeliveredScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';

const Stack = createStackNavigator();

const App = () => {
  const screenOptions = {
    headerStyle: {
      backgroundColor: '#287238',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
        <Stack.Screen name="RiderCodes" component={RiderCodesScreen} options={{ title: 'Rider Name'}}/>
        <Stack.Screen name="ReverseDelieveredScreen" component={ReverseDeliveredScreen} options={{ title: 'Reverse Delivered Product Details' }} />
        <Stack.Screen name="ReverseNotDelieveredScreen" component={ReverseNotDeliveredScreen} options={{ title: 'Reverse Not Delivered Product Details' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;