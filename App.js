import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RiderCodesScreen from './screens/RiderCodesScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import LoginScreen from './screens/LoginScreen'; // Import your LoginScreen component
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RegisterScreen from './screens/RegisterScreen'; // Import your RegisterScreen component

const Stack = createStackNavigator();

const App = () => {
  const screenOptions = {
    headerStyle: {
      backgroundColor: '#287238',
    },
    headerTintColor: '#fff', // Title color
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="RiderCodes" component={RiderCodesScreen} options={{ title: 'Rider Codes' }} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
