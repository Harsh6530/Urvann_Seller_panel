import { API_BASE_URL } from '@env';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
      if (response.status === 200 && response.data.token) {
        Alert.alert('Login successful', `Welcome, ${username}!`);
        navigation.navigate('RiderCodes', { sellerName: username });
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.buttonText, styles.registerButtonText]}>New user? Register</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.forgotButton} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotButtonText}>Forgot Password?</Text>
            </TouchableOpacity> */}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logo: {
    marginTop: 100,
    width: 220,
    height: 40,
    marginBottom: 50,
  },
  innerContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
    alignItems: 'center',
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
  forgotButton: {
    marginTop: 10,
  },
  forgotButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
});

export default LoginScreen;
