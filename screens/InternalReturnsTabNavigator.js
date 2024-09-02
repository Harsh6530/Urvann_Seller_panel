import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import DeliveredScreen from './DeliveredScreen';
import NotDeliveredScreen from './NotDeliveredScreen';

const InternalReturnsTabNavigator = () => {
  const route = useRoute();
  const { sellerName } = route.params || {}; // Extract sellerName from route params
  const [selectedTab, setSelectedTab] = useState('NotDelivered');

  const renderContent = () => {
    if (selectedTab === 'Delivered') {
      return <DeliveredScreen sellerName={sellerName} />;
    } else {
      return <NotDeliveredScreen sellerName={sellerName} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'NotDelivered' && styles.activeTab]}
          onPress={() => setSelectedTab('NotDelivered')}
        >
          <Text style={[styles.tabText, selectedTab === 'NotDelivered' && styles.activeTabText]}>
            Not Delivered
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Delivered' && styles.activeTab]}
          onPress={() => setSelectedTab('Delivered')}
        >
          <Text style={[styles.tabText, selectedTab === 'Delivered' && styles.activeTabText]}>
            Delivered
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 7,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#287238',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 7,
  },
  activeTab: {
    backgroundColor: '#1f5a28',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  activeTabText: {
    color: '#ffed8a',
  },
  contentContainer: {
    flex: 1,
  },
});

export default InternalReturnsTabNavigator;