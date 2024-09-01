import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // For the down arrow icon
import { FontAwesome } from '@expo/vector-icons'; // For the star icon
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // Import the KeyboardAwareScrollView

const ShootSectionScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [products, setProducts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState({
    Name: '',
    'Additional Info': '',
    Size: '',
    Pot: 'Nursery bag',
    'Seller Price': '',
  });
  const [potType, setPotType] = useState('Nursery bag');
  const [showPotInput, setShowPotInput] = useState(false); // State to toggle manual input field for "Others"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://10.5.16.226:5001/api/products/${sellerName}`);
        setProducts(response.data);
        if (response.data.length > 0) {
          setSelectedIndex(0);
          updateFormData(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sellerName]);

  const updateFormData = (product) => {
    setFormData({
      Name: product.Name || '',
      'Additional Info': product['Additional Info'] || '',
      Size: product.Size ? product.Size.toString() : '', // Ensure Size is a string for TextInput
      Pot: product.Pot || 'Nursery bag',
      'Seller Price': product['Seller Price'] ? product['Seller Price'].toString() : '', // Convert to string
    });
    setPotType(product.Pot || 'Nursery bag');
    setShowPotInput(product.Pot === 'Others');
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePotTypeChange = (value) => {
    setPotType(value);
    setFormData({ ...formData, Pot: value });
    setShowPotInput(value === 'Others');
  };

  const saveData = async () => {
    // Check if required fields are filled
    if (!formData.Name?.trim() || !formData.Size?.trim() || !formData.Pot?.trim() || !formData['Seller Price']?.trim()) {
      Alert.alert('Error', 'Please fill all the required fields marked with a star.');
      return false;
    }

    try {
      const productId = products[selectedIndex]._id;
      const response = await axios.put(`http://10.5.16.226:5001/api/products/${productId}`, formData);

      // Update the local products array with the updated product data
      const updatedProducts = [...products];
      updatedProducts[selectedIndex] = response.data;

      setProducts(updatedProducts);

      Alert.alert('Success', 'Data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data');
      return false;
    }
  };

  const handleNext = async () => {
    const isSaved = await saveData();
    if (isSaved && selectedIndex < products.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      updateFormData(products[selectedIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      updateFormData(products[selectedIndex - 1]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const selectedProduct = products[selectedIndex];

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardShouldPersistTaps="handled" // Ensures taps are handled even when keyboard is open
    >
      <View style={styles.imageContainer}>
        {selectedProduct.image_url ? (
          <Image source={{ uri: selectedProduct.image_url }} style={styles.productImage} />
        ) : (
          <Text style={styles.errorText}>No image available</Text>
        )}
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>
          Name <FontAwesome name="star" size={10} color="red" /> {/* Star icon to indicate required field */}
        </Text>
        <TextInput
          style={styles.input}
          value={formData.Name}
          onChangeText={(text) => handleInputChange('Name', text)}
          placeholder="Enter product name"
          required
        />

        <Text style={styles.label}>Additional Info</Text>
        <TextInput
          style={styles.input}
          value={formData['Additional Info']}
          onChangeText={(text) => handleInputChange('Additional Info', text)}
          placeholder="Enter additional information"
        />

        <Text style={styles.label}>
          Size (in inch) <FontAwesome name="star" size={10} color="red" />
        </Text>
        <TextInput
          style={styles.input}
          value={formData.Size}
          onChangeText={(text) => handleInputChange('Size', text)}
          placeholder="Enter size in inches"
          keyboardType="numeric"
          required
        />

        <Text style={styles.label}>
          Pot Type <FontAwesome name="star" size={10} color="red" />
        </Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowPotInput(!showPotInput)}
        >
          <Text style={styles.pickerText}>{potType}</Text>
          <Ionicons name="chevron-down" size={20} color="#333" style={styles.pickerIcon} />
        </TouchableOpacity>
        {showPotInput ? (
          <View style={styles.pickerOptions}>
            <TouchableOpacity onPress={() => handlePotTypeChange('Nursery bag')} style={styles.pickerOption}>
              <Text style={styles.pickerOptionText}>Nursery bag</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePotTypeChange('Nursery Pot')} style={styles.pickerOption}>
              <Text style={styles.pickerOptionText}>Nursery Pot</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePotTypeChange('Ceramic Pot')} style={styles.pickerOption}>
              <Text style={styles.pickerOptionText}>Ceramic Pot</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePotTypeChange('Clay pot')} style={styles.pickerOption}>
              <Text style={styles.pickerOptionText}>Clay pot</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePotTypeChange('Hanging Pot')} style={styles.pickerOption}>
              <Text style={styles.pickerOptionText}>Hanging Pot</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePotTypeChange('Urvann Pot')} style={styles.pickerOption}>
              <Text style={styles.pickerOptionText}>Urvann Pot</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePotTypeChange('Repotted Pot')} style={styles.pickerOption}>
              <Text style={styles.pickerOptionText}>Repotted Pot</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePotTypeChange('Others')} style={styles.pickerOption}>
              <Text style={styles.pickerOptionText}>Others</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {potType === 'Others' && (
          <TextInput
            style={styles.input}
            value={formData.Pot}
            onChangeText={(text) => handleInputChange('Pot', text)}
            placeholder="Enter pot type"
          />
        )}

        <Text style={styles.label}>
          Seller Price <FontAwesome name="star" size={10} color="red" />
        </Text>
        <TextInput
          style={styles.input}
          value={formData['Seller Price']}
          onChangeText={(text) => handleInputChange('Seller Price', text)}
          placeholder="Enter seller price"
          keyboardType="numeric"
          required
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePrevious}
            disabled={selectedIndex === 0}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            disabled={selectedIndex === products.length - 1}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light background color for better contrast
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  productImage: {
    width: 250, // Increased size for better visibility
    height: 250,
    resizeMode: 'cover',
    borderRadius: 12, // Rounded corners for the image
    borderWidth: 2,
    borderColor: '#ddd', // Subtle border color
  },
  formContainer: {
    backgroundColor: '#fff', // White background for the form
    borderRadius: 12, // Rounded corners for the form container
    padding: 16,
    shadowColor: '#000', // Shadow for subtle elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2, // Elevation for Android
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600', // Slightly lighter font weight for labels
    marginBottom: 8,
    color: '#333', // Dark color for better readability
  },
  input: {
    height: 45, // Increased height for better touch experience
    borderColor: '#ccc', // Subtle border color
    borderWidth: 1,
    borderRadius: 8, // More rounded corners
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa', // Light background for inputs
    fontSize: 16,
    color: '#333', // Dark text color for better readability
  },
  pickerContainer: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000', // Shadow for subtle elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2, // Elevation for Android
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  pickerIcon: {
    marginLeft: 8,
  },
  pickerOptions: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  pickerOption: {
    padding: 12,
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14, // Increased padding for better touch experience
    borderRadius: 8, // More rounded corners
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000', // Shadow for subtle elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2, // Elevation for Android
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, // Larger font size for buttons
    fontWeight: '600', // Slightly lighter font weight for button text
  },
  errorText: {
    color: '#d9534f', // Red color for errors
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 16,
  },
});


export default ShootSectionScreen;
