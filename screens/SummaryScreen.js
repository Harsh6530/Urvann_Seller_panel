import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const SummaryScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`https://urvann-seller-panel-yc3k.onrender.com/api/summary/${sellerName}`);
        setSummary(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching summary:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchSummary();
  }, [sellerName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#287238" />
        <Text>Loading summary...</Text>
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading summary data.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.card}>
          {Object.keys(summary).map((key) => {
            if (key === '_id' || key === 'B2b deductions') {
              return null; // Skip rendering _id and B2b deductions fields
            }
            return (
              <View style={styles.row} key={key}>
                <Text style={styles.headerCell}>{key}</Text>
                <Text style={styles.cell}>{summary[key]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  container: {
    width: '100%',
    maxWidth: 600,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#333',
    width: '50%',
  },
  cell: {
    color: '#666',
    width: '50%',
    textAlign: 'right',
  },
});

export default SummaryScreen;
