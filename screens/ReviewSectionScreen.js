import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, Button, ActivityIndicator, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import axios from 'axios';

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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://10.112.104.99:5001/api/reviews/${sellerName}`);
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

    fetchReviews();
  }, [sellerName]);

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
      const response = await axios.put(`http://10.112.104.99:5001/api/reviews/${reviewId}`, updatedReviewData);
  
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
  
  const handleNext = () => {
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
  
  const handleSaveAndNavigate = (direction) => {
    // This function now only handles navigation without saving data
    if (direction === 'next') {
      handleNext();
    } else if (direction === 'previous') {
      handlePrevious();
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

  const selectedReview = reviews[selectedIndex];

  return (
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

            <Text style={styles.label}>SKU</Text>
            <TextInput
              style={styles.input}
              value={formData.sku}
              onChangeText={(text) => handleInputChange('sku', text)}
              placeholder="Enter SKU"
              editable={false}
            />

            <Text style={styles.label}>Available</Text>
            <Switch
              value={formData.Available}
              onValueChange={handleAvailableChange}
            />

            {formData.Available && (
              <>
                <Text style={styles.label}>Current Price</Text>
                <TextInput
                  style={styles.input}
                  value={formData.CurrentPrice ? formData.CurrentPrice.toString() : ''}
                  onChangeText={(text) => handleInputChange('CurrentPrice', text)}
                  placeholder="Enter current price"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Suggested Price</Text>
                <TextInput
                  style={styles.input}
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
                onPress={() => handleSaveAndNavigate('previous')}
                disabled={selectedIndex === 0}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonNext]}
                onPress={() => handleSaveAndNavigate('next')}
                disabled={selectedIndex === reviews.length - 1}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={saveData}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 15,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  buttonPrevious: {
    backgroundColor: '#d9534f',
  },
  buttonNext: {
    backgroundColor: '#5bc0de',
  },
  buttonSave: {
    backgroundColor: '#5cb85c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ReviewSectionScreen;
