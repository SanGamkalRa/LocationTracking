import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, {Marker, Polygon} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
//Getting Battery Optimization Status from Native Module
const {BatteryOptimization} = NativeModules;

console.log(BatteryOptimization.isBatteryOptimizationEnabled,"Battery Optimization")

function App() {

  const [currentLocation, setCurrentLocation] = useState(null);
  const [saverMode, setsaverMode] = useState(false);
  
  useEffect(() => {
    if (Platform.OS === 'android') {
      BatteryOptimization.isBatteryOptimizationEnabled()
        .then((isEnabled: any) => {
          console.log('Battery optimization enabled:', isEnabled);
          setsaverMode(isEnabled);
          if (isEnabled == true) {
            Alert.alert('Battery Saver mode enabled Map might not work !');
          }
        })
        .catch((error: any) => {
          console.error('Error checking battery optimization:', error);
        });
    } else {
      console.log(
        'Battery optimization status can only be checked on Android.',
      );
    }
  }, [BatteryOptimization]);

  useEffect(() => {
    // Fetch user's current location
    fetchLocation();

    // timer to fetch location every 10 minutes
    const intervalId = setInterval(fetchLocation, 10 * 60 * 1000);

    // Clean up timer on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
      },
      error => console.log(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };
  const polygon = [
    {latitude: 28.457523, longitude: 77.026344},
    {latitude: 28.6448, longitude: 77.216721},
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
            zoomControlEnabled
            showsUserLocation>
            <Marker coordinate={currentLocation} />
            <Polygon coordinates={polygon} strokeColor="red" />
          </MapView>
          <View style={styles.batteryStatusView}>
            <Text style={styles.batteryStatusTxt}>
              Battery Optimization Status : {saverMode == true ? 'ON' : 'OFF'}
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
    width: '70%',
    height: 40,
    backgroundColor: 'red',
    top: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryStatusTxt: {fontSize: 14, color: '#fff'},
});

export default App;