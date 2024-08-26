import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // For the down arrow icon

const ShootSectionScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [products, setProducts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState({
    Name: '',
    'Additional Info': '',
    size: '',
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
        const response = await axios.get(`http://10.112.104.99:5001/api/products/${sellerName}`);
       //console.log('Fetched products:', response.data); // Check the response data
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
    //console.log('Updating form data with product:', product);
    setFormData({
      Name: product.Name,
      'Additional Info': product['Additional Info'],
      size: product.size,
      Pot: product.Pot,
      'Seller Price': product['Seller Price'] ? product['Seller Price'].toString() : '', // Convert to string
    });
    setPotType(product.Pot);
    setShowPotInput(product.Pot === 'Others');
  };
  
  const handleInputChange = (field, value) => {
    //console.log(`Updating ${field} with value: ${value}`);
    setFormData({ ...formData, [field]: value });
  };

  const handlePotTypeChange = (value) => {
    setPotType(value);
    setFormData({ ...formData, Pot: value });
    setShowPotInput(value === 'Others');
  };

  const saveData = async () => {
    try {
      const productId = products[selectedIndex]._id;
      const response = await axios.put(`http://10.112.104.99:5001/api/products/${productId}`, formData);

      // Update the local products array with the updated product data
      const updatedProducts = [...products];
      updatedProducts[selectedIndex] = response.data;

      setProducts(updatedProducts);

      Alert.alert('Success', 'Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const handleNext = () => {
    if (selectedIndex < products.length - 1) {
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
  

  const handleSaveAndNavigate = (direction) => {
    saveData().then(() => {
      if (direction === 'next') {
        handleNext();
      } else if (direction === 'previous') {
        handlePrevious();
      }
    });
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
    <View style={styles.container}>
      {selectedProduct && (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.imageContainer}>
            {selectedProduct.image_url ? (
              <Image source={{ uri: selectedProduct.image_url }} style={styles.productImage} />
            ) : (
              <Text style={styles.errorText}>No image available</Text>
            )}
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Name</Text>
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

            <Text style={styles.label}>Size (in inch)</Text>
            <TextInput
              style={styles.input}
              value={formData.size}
              onChangeText={(text) => handleInputChange('size', text)}
              placeholder="Enter size in inches"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Pot Type</Text>
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
                placeholder="Specify pot type"
              />
            )}

            <Text style={styles.label}>Seller Price</Text>
            <TextInput
              style={styles.input}
              value={formData['Seller Price'] || ''}
              onChangeText={(text) => handleInputChange('Seller Price', text)}
              placeholder="Enter seller price"
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrevious]}
                onPress={() => handlePrevious()}
                disabled={selectedIndex === 0}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonNext]}
                onPress={() => handleNext()}
                disabled={selectedIndex === products.length - 1}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={saveData}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  pickerIcon: {
    marginLeft: 10,
  },
  pickerOptions: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 16,
    padding: 10,
  },
  pickerOption: {
    padding: 10,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonPrevious: {
    backgroundColor: '#007bff',
    marginRight: 10,
  },
  buttonNext: {
    backgroundColor: '#28a745',
  },
  buttonSave: {
    backgroundColor: '#ffc107',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ShootSectionScreen;
