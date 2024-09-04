import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, ActivityIndicator, Platform, ScrollView, TouchableOpacity, Alert, Switch,  } from 'react-native';
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RefreshButton from '../components/RefeshButton';

const ReviewSectionScreen = ({ navigation, route }) => {
  const { sellerName } = route.params; // Get sellerName from route params
  const [reviews, setReviews] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    CurrentPrice: '',
    SuggestedPrice: '',
    Available: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://10.117.4.182:5001/api/reviews/${sellerName}`);
      setReviews(response.data);
      if (response.data.length > 0) {
        setSelectedIndex(0);
        updateFormData(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sellerName]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const updateFormData = (review) => {
    setFormData({
      name: review.name || '',
      sku: review.sku || '',
      CurrentPrice: review["Current Price"] || '',
      SuggestedPrice: review["Suggested Price"] || '',
      Available: review.Available === 1, // Convert from number to boolean
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAvailableChange = (value) => {
    setFormData({
      ...formData,
      Available: value
    });
  };

  const saveData = async () => {
    try {
      const reviewId = reviews[selectedIndex]._id;

      if (!reviewId) {
        throw new Error('Review ID is missing');
      }

      // Prepare the data to be updated
      const updatedReviewData = {
        ...formData,
        "Current Price": parseFloat(formData.CurrentPrice) || 0,
        "Suggested Price": parseFloat(formData.SuggestedPrice) || 0,
        Available: formData.Available ? 'yes' : 'no'
      };

      // Send the update request to the server
      const response = await axios.put(`http://10.117.4.182:5001/api/reviews/${reviewId}`, updatedReviewData);

      // Update the local reviews array with the updated review data
      const updatedReviews = [...reviews];
      updatedReviews[selectedIndex] = response.data; // Assuming the response contains the updated review

      setReviews(updatedReviews);

      Alert.alert('Success', 'Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const handleNext = async () => {
    await saveData(); // Save the current review data before navigating
    if (selectedIndex < reviews.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      updateFormData(reviews[selectedIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      updateFormData(reviews[selectedIndex - 1]);
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
        <RefreshButton onRefresh={fetchReviews} />
      </View>
    );
  }

  const selectedReview = reviews[selectedIndex];

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardShouldPersistTaps="handled" // Ensures taps are handled even when keyboard is open
    >
      <View style={styles.container}>
        {selectedReview && (
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedReview.image_url }} style={styles.productImage} />
            </View>
            <View style={styles.formContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter name"
                editable={false}
              />

              <View style={styles.rowContainer}>
                <View style={styles.skuContainer}>
                  <Text style={styles.label}>SKU</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.sku}
                    onChangeText={(text) => handleInputChange('sku', text)}
                    placeholder="Enter SKU"
                    editable={false}
                  />
                </View>

                <View style={styles.availableContainer}>
                  <Text style={styles.label}>Available</Text>
                  <Switch
                    value={formData.Available}
                    onValueChange={handleAvailableChange}
                    trackColor={{ true: '#007bff', false: '#ccc' }} // Color when the switch is on/off
                    thumbColor={formData.Available ? '#fff' : '#fff'} // Color of the switch thumb
                  />
                </View>
              </View>

              {formData.Available && (
                <>
                  <Text style={styles.label}>Current Seller Price</Text>
                  <TextInput
                    style={[styles.input, styles.currentPriceInput]}
                    value={formData.CurrentPrice ? formData.CurrentPrice.toString() : ''}
                    onChangeText={(text) => handleInputChange('CurrentPrice', text)}
                    placeholder="Enter current price"
                    keyboardType="numeric"
                    editable={false} // Make this field non-editable
                  />

                  <Text style={styles.label}>New Seller Price</Text>
                  <TextInput
                    style={[styles.input, styles.suggestedPriceInput]}
                    value={formData.SuggestedPrice ? formData.SuggestedPrice.toString() : ''}
                    onChangeText={(text) => handleInputChange('SuggestedPrice', text)}
                    placeholder="Enter suggested price"
                    keyboardType="numeric"
                  />
                </>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrevious]}
                  onPress={handlePrevious}
                  disabled={selectedIndex === 0}
                >
                  <Text style={styles.buttonText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonNext]}
                  onPress={handleNext}
                  disabled={selectedIndex === reviews.length - 1}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
        <RefreshButton onRefresh={fetchReviews} />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  productImage: {
    width: 250,
    height: 250,
    resizeMode: 'cover',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
    width: '100%', // Adjust form container width as needed
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 30, // Reduced height for input boxes
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    fontSize: 16,
    color: '#333',
  },
  currentPriceInput: {
    width: '100%', // Make the input field full width
  },
  suggestedPriceInput: {
    width: '100%', // Make the input field full width
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  skuContainer: {
    flex: 1,
    marginRight: 10,
  },
  availableContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonPrevious: {
    backgroundColor: '#6c757d',
  },
  buttonNext: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ReviewSectionScreen;

