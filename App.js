import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SellerTiles from './screens/SellerTiles'; // Adjust path as per your actual file location
import RiderCodesScreen from './screens/RiderCodesScreen'; // Adjust path as per your actual file location

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SellerTiles">
        <Stack.Screen name="SellerTiles" component={SellerTiles} options={{ title: 'Sellers' }} />
        <Stack.Screen name="RiderCodes" component={RiderCodesScreen} options={{ title: 'Rider Codes' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
