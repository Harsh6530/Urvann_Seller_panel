// LazyImage.js
import React, { useState } from 'react';
import { Image, ActivityIndicator, View, StyleSheet } from 'react-native';

const LazyImage = ({ source, style }) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={[style, styles.container]}>
      {loading && (
        <ActivityIndicator
          style={StyleSheet.absoluteFill}
          size="small"
          color="#0000ff"
        />
      )}
      <Image
        source={source}
        style={style}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LazyImage;


