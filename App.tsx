import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const { BatteryOptimization } = NativeModules;

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [saverMode, setSaverMode] = useState(false);

  useEffect(() => {
    const watchLocation = () => {
      const watchId = Geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        error => console.log(error.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
      );

      return watchId;
    };

    const updateLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        error => console.log(error.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
      );

      const timerId = setInterval(() => {
        Geolocation.clearWatch(watchLocation());
        watchLocation();
      }, 10 * 60 * 1000);

      return () => clearInterval(timerId);
    };

    if (Platform.OS === 'android') {
      BatteryOptimization.isBatteryOptimizationEnabled()
        .then(isEnabled => {
          console.log('Battery optimization enabled:', isEnabled);
          setSaverMode(isEnabled);
          if (isEnabled) {
            Alert.alert('Battery Saver mode enabled. Map might not work!');
          }
        })
        .catch(error => {
          console.error('Error checking battery optimization:', error);
        });
    } else {
      console.log(
        'Battery optimization status can only be checked on Android.',
      );
    }

    updateLocation();

    return () => Geolocation.clearWatch(watchLocation());
  }, []);

  const polygon = [
    {
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
    },
    { latitude: 28.6448, longitude: 77.216721 },
  ];

  return (
    <View style={styles.container}>
      {currentLocation ? (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation?.latitude,
              longitude: currentLocation?.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            zoomControlEnabled>
            <Marker coordinate={currentLocation} />
            <Polyline
              coordinates={polygon}
              strokeColor="orange"
              strokeWidth={3}
              lineDashPattern={[10, 20]}
            />
          </MapView>
          <View style={styles.batteryStatusView}>
            <Text style={styles.batteryStatusTxt}>
              Battery Optimization Status: {saverMode ? 'ON' : 'OFF'}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <ActivityIndicator animating={true} size={'large'} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  batteryStatusView: {
    width: '100%',
    height: 40,
    backgroundColor: 'lightblue',
    top: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryStatusTxt: { fontSize: 14, color: '#fff' },
});

export default App;
