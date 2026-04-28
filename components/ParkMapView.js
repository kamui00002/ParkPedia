// 公園マップビューコンポーネント
// react-native-maps の MapView を使用した公園マップ表示

import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

let MapView, Marker, Callout;
try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Callout = maps.Callout;
} catch {
  MapView = null;
  Marker = null;
  Callout = null;
}

// Props: { parks, userLocation, onParkPress }
export default function ParkMapView({ parks, userLocation, onParkPress }) {
  const mapRef = useRef(null);

  const defaultRegion = {
    latitude: userLocation?.latitude || 35.6762,
    longitude: userLocation?.longitude || 139.6503,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // 有効な座標を持つ公園のみ表示（0も有効な座標値なので != null で判定）
  const validParks = parks.filter(p => p.latitude != null && p.longitude != null);

  if (!MapView) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>マップを読み込めませんでした</Text>
      </View>
    );
  }

  try {
    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={defaultRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {validParks.map(park => (
            <Marker
              key={park.id}
              coordinate={{ latitude: park.latitude, longitude: park.longitude }}
              title={park.name}
            >
              <Callout onPress={() => onParkPress(park)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {park.name}
                  </Text>
                  <Text style={styles.calloutRating}>
                    ★ {(park.rating || 0).toFixed(1)} ({park.reviewCount || 0}件)
                  </Text>
                  {park.address && (
                    <Text style={styles.calloutAddress} numberOfLines={1}>
                      {park.address}
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>
    );
  } catch {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>マップを読み込めませんでした</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 4,
  },
  calloutRating: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  calloutAddress: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FBF8',
  },
  fallbackText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
