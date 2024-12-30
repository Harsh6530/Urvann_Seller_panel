import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, ActivityIndicator, Platform, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
    additionalInfo: '', // New field for additional info
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [percentageChange, setPercentageChange] = useState(0); // For price percentage change

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`https://urvann-seller-panel-version.onrender.com/api/reviews/${sellerName}`);
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

  const updateFormData = (review) => {
    setFormData({
      name: review.name || '',
      sku: review.sku || '',
      CurrentPrice: review["Current Price"] || '',
      SuggestedPrice: review["Suggested Price"] || '',
      Available: review.Available === 1, // Convert from number to boolean
      additionalInfo: review.additional_info, // New field initialized as empty
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

  const handlePercentageChange = (percentage) => {
    setPercentageChange(percentage);
    const updatedSuggestedPrice = (parseFloat(formData.CurrentPrice) * (1 + percentage / 100)).toFixed(2);
    setFormData({ ...formData, SuggestedPrice: updatedSuggestedPrice });
  };

  const saveData = async () => {
    try {
      const reviewId = reviews[selectedIndex]._id;

      if (!reviewId) {
        throw new Error('Review ID is missing');
      }

      const updatedReviewData = {
        ...formData,
        "Current Price": parseFloat(formData.CurrentPrice) || 0,
        "Suggested Price": parseFloat(formData.SuggestedPrice) || 0,
        Available: formData.Available ? 'yes' : 'no',
        additionalInfo: formData.additionalInfo, // Send additional info
      };

      const response = await axios.put(`https://urvann-seller-panel-version.onrender.com/api/reviews/${reviewId}`, updatedReviewData);

      const updatedReviews = [...reviews];
      updatedReviews[selectedIndex] = response.data;

      setReviews(updatedReviews);

      Alert.alert('Success', 'Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const handleNext = async () => {
    await saveData();
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

  const selectedReview = reviews[selectedIndex];

  if (error || !selectedReview) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || "No data"}</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        {selectedReview && (
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedReview.image_url }} style={styles.productImage} />
            </View>
            <View style={styles.formContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, styles.nonEditable]} // Non-editable field with lighter color
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter name"
                editable={false}
              />

              <Text style={styles.label}>Additional Information</Text>
              <TextInput
                style={[styles.input, styles.editableInput]} // Additional info field
                value={formData.additionalInfo}
                onChangeText={(text) => handleInputChange('additionalInfo', text)}
                placeholder="Enter additional info"
              />

              <View style={styles.rowContainer}>
                <View style={styles.skuContainer}>
                  <Text style={styles.label}>SKU</Text>
                  <TextInput
                    style={[styles.input, styles.nonEditable]} // Non-editable field
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
                    trackColor={{ true: '#007bff', false: '#ccc' }}
                    thumbColor={formData.Available ? '#fff' : '#fff'}
                  />
                </View>
              </View>

              {formData.Available && (
                <>
                  <View style={styles.priceContainer}>
                    <View style={styles.halfWidth}>
                      <Text style={styles.label}>Current Seller Price</Text>
                      <TextInput
                        style={[styles.input, styles.currentPriceInput, styles.nonEditable]} // Non-editable with lighter color
                        value={formData.CurrentPrice ? formData.CurrentPrice.toString() : ''}
                        onChangeText={(text) => handleInputChange('CurrentPrice', text)}
                        placeholder="Enter current price"
                        keyboardType="numeric"
                        editable={false}
                      />
                    </View>

                    <View style={styles.halfWidth}>
                      <Text style={styles.label}>New Seller Price</Text>
                      <TextInput
                        style={[styles.input, styles.suggestedPriceInput, styles.editableInput]} // Editable field
                        value={formData.SuggestedPrice ? formData.SuggestedPrice.toString() : ''}
                        onChangeText={(text) => handleInputChange('SuggestedPrice', text)}
                        placeholder="Enter suggested price"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.label}>Change Percentage</Text>
                  <View style={styles.percentageButtons}>
                    <TouchableOpacity onPress={() => handlePercentageChange(-5)} style={styles.percentageButton}>
                      <Text style={styles.percentageButtonText}>-5%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePercentageChange(-10)} style={styles.percentageButton}>
                      <Text style={styles.percentageButtonText}>-10%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePercentageChange(0)} style={styles.percentageButton}>
                      <Text style={styles.percentageButtonText}>No Change</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrevious, (selectedIndex === 0 ? styles.buttonDisabled : null)]}
                  onPress={handlePrevious}
                  disabled={selectedIndex === 0}
                >
                  <Text style={styles.buttonText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonNext]}
                  onPress={handleNext}
                >
                  <Text style={styles.buttonText}>
                    {selectedIndex === reviews.length - 1 ? "Save" : "Next"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  nonEditable: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  editableInput: {
    borderColor: "#007bff",
    color: '#000',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skuContainer: {
    width: '55%', // Set SKU container width to 
    marginRight: 5,
  },
  availableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginBottom: 8,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 2,
  },
  currentPriceInput: {
    backgroundColor: '#f0f0f0',
  },
  suggestedPriceInput: {
    color: '#000',
  },
  percentageButtons: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  percentageButton: {
    flex: 1, // Ensures buttons take up equal width
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 4, // Space between buttons
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
  },
  percentageButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16, // Increased padding for better touch experience
    borderRadius: 8, // More rounded corners
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
    shadowColor: '#000', // Shadow for subtle elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2, // Elevation for Android
    marginBottom: 20,
    fontWeight: 600,
  },
  buttonPrevious: {
    backgroundColor: '#007bff', // Blue color for Previous button
    marginRight: 10,
    
  },
  buttonNext: {
    backgroundColor: '#007bff', // Blue color for Next button
    marginLeft: 10,
  },
  buttonDisabled: {
    backgroundColor: '#b0b0b0', // Grey color for disabled button
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#d9534f', // Red color for errors
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 16,
  },
});


export default ReviewSectionScreen;