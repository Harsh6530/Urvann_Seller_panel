import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const SummaryScreen = ({ route }) => {
  const { sellerName } = route.params;
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`http://192.168.0.51:5001/api/summary/${sellerName}`);
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
      <View style={styles.container}>
        <Text>Loading summary...</Text>
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={styles.container}>
        <Text>Error loading summary data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary for {sellerName}</Text>
      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Payable</Text>
            <Text style={styles.headerCell}>Refunds</Text>
            <Text style={styles.headerCell}>Other Additions</Text>
            <Text style={styles.headerCell}>B2B Sales</Text>
            <Text style={styles.headerCell}>Stickers</Text>
            <Text style={styles.headerCell}>Penalty</Text>
            <Text style={styles.headerCell}>Total Paid</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>{summary.Name}</Text>
            <Text style={styles.cell}>{summary.Payable}</Text>
            <Text style={styles.cell}>{summary.Refunds}</Text>
            <Text style={styles.cell}>{summary['Other additions']}</Text>
            <Text style={styles.cell}>{summary['B2B sales']}</Text>
            <Text style={styles.cell}>{summary.Stickers}</Text>
            <Text style={styles.cell}>{summary.Penalty}</Text>
            <Text style={styles.cell}>{summary['Total Paid']}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});

export default SummaryScreen;