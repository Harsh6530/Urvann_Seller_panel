import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const SummaryScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`http://10.112.104.101:5001/api/summary/${sellerName}`);
        if (Object.keys(response.data).length === 0) {
          setNoData(true); // No data but no error
        } else {
          setSummary(response.data);
          setNoData(false); // Reset noData if data is found
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error.response && error.response.status === 404) {
          setError(`Oops! No summary data available for ${sellerName}.`);
        } else {
          setError('Error loading summary data.');
        }
      }
    };

    fetchSummary();
  }, [sellerName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#287238" />
        <Text style={styles.loadingText}>Loading summary...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.sadEmoji}>😔</Text>
        <Text style={styles.noDataText}>{error}</Text>
      </View>
    );
  }

  if (noData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.sadEmoji}>😔</Text>
        <Text style={styles.noDataText}>Oops! No summary data available for {sellerName}.</Text>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  sadEmoji: {
    fontSize: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
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
