import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`https://urvann-seller-panel-yc3k.onrender.com/api/login`, { username, password });
      if (response.status === 200 && response.data.token) {
        if (keepLoggedIn) {
          await AsyncStorage.setItem('userToken', response.data.token);
        }
        Alert.alert('Login successful', `Welcome, ${username}!`);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { sellerName: username } }],
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert('Login failed', 'Invalid credentials');
      } else {
        console.error('Error during login:', error);
        Alert.alert('Login failed', 'User does not exist');
      }
    }
  };

  return (
    <LinearGradient colors={['#fff', '#fff']} style={styles.container}>
      <Image source={require('../assets/urvann.png')} style={styles.logo} />
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Seller login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={(text) => setUsername(text.toUpperCase())}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={keepLoggedIn}
            onValueChange={setKeepLoggedIn}
          />
          <Text style={styles.checkboxLabel}>Keep me logged in</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.buttonText, styles.registerButtonText]}>New user? Register</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    marginLeft: 85,
    marginTop: 80,
    width: 220,
    height: 40,
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#287238',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    width: '100%',
  },
  registerButtonText: {
    color: '#4CAF50',
  },
});

export default LoginScreen;
