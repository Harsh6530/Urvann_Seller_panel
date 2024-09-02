import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RiderCodesPickedScreen from './PickedScreen';
import RiderCodesNotPickedScreen from './NotPickedScreen';

const InternalPickupTabNavigator = ({ route }) => {
  const { sellerName } = route.params;
  const [selectedTab, setSelectedTab] = useState('NotPicked');

  const renderContent = () => {
    if (selectedTab === 'Picked') {
      return <RiderCodesPickedScreen sellerName={sellerName} />;
    } else {
      return <RiderCodesNotPickedScreen sellerName={sellerName} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'NotPicked' && styles.activeTab]}
          onPress={() => setSelectedTab('NotPicked')}
        >
          <Text style={[styles.tabText, selectedTab === 'NotPicked' && styles.activeTabText]}>
            Not Picked
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Picked' && styles.activeTab]}
          onPress={() => setSelectedTab('Picked')}
        >
          <Text style={[styles.tabText, selectedTab === 'Picked' && styles.activeTabText]}>
            Picked
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
    // padding: 50,
  },
});

export default InternalPickupTabNavigator;