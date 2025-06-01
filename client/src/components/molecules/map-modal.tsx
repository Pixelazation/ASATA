import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Pressable,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MapView from 'react-native-maps';
import { View, Text, Button, Modal } from 'react-native-ui-lib';
import { GeocodingApi } from '../../services/api/geocoding';
import { colors } from '../../utils/designSystem';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

type Props = {
  initLoc?: { loc: string, long: number | null, lat: number | null }
  setLocation?: (loc: string, long: number, lat: number) => void;
  visible: boolean;
  closeModal: () => void;
};

export const MapModal: React.FC<Props> = ({
  initLoc,
  setLocation,
  visible,
  closeModal,
}) => {
  const mapRef = useRef<MapView>(null);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch device location on modal open
  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission Denied", "Location permission is required.");
            return;
          }
          const currentLocation = await Location.getCurrentPositionAsync({});
          const coords = {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
          };
          setDeviceCoords(coords);
          setCenterCoords(coords);
          setLoading(true);
          const result = await GeocodingApi.reverseGeocode(coords.lat, coords.lng);
          setAddress(result ? result.fullAddress : 'Unknown location');
          setLoading(false);
          setTimeout(() => {
            mapRef.current?.animateToRegion({
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }, 1);
          }, 300);
        } catch (e) {
          Alert.alert("Error", "Failed to fetch current location.");
        }
      })();
    }
  }, [visible]);

  // Update address when map region changes (center pin)
  const handleRegionChangeComplete = async (region: any) => {
    setCenterCoords({ lat: region.latitude, lng: region.longitude });
    setLoading(true);
    const result = await GeocodingApi.reverseGeocode(region.latitude, region.longitude);
    setAddress(result ? result.fullAddress : 'Unknown location');
    setLoading(false);
  };

  // Center map on current device location
  const handleCurrentLocation = async () => {
    if (!deviceCoords) return;
    mapRef.current?.animateToRegion({
      latitude: deviceCoords.lat,
      longitude: deviceCoords.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
    setCenterCoords(deviceCoords);
    setLoading(true);
    const result = await GeocodingApi.reverseGeocode(deviceCoords.lat, deviceCoords.lng);
    setAddress(result ? result.fullAddress : 'Unknown location');
    setLoading(false);
  };

  const confirmLocation = () => {
    if (setLocation && address && centerCoords) {
      setLocation(address, centerCoords.lng, centerCoords.lat);
      closeModal();
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      overlayBackgroundColor="rgba(151, 151, 151, 0.45)"
      visible={visible}
    >
      <KeyboardAvoidingView style={styles.fullScreen} behavior="padding">
        <Pressable style={styles.overlay} onPress={closeModal} />

        <View style={styles.modalContent}>
          <View style={styles.contentCard}>
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: centerCoords?.lat ?? 10.3157,
                  longitude: centerCoords?.lng ?? 123.8854,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onRegionChangeComplete={handleRegionChangeComplete}
              />
              {/* Center Pin Overlay */}
              <View pointerEvents="none" style={styles.centerPinContainer}>
                <MaterialIcons name="place" size={48} color={colors.primary} />
              </View>
              {/* Current Location Button */}
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={handleCurrentLocation}
                activeOpacity={0.7}
              >
                <MaterialIcons name="my-location" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.addressContainer}>
              {loading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text style={{ fontWeight: 'bold' }}>{address || 'Drag the pin to your desired location.'}</Text>
              )}
            </View>

            <View style={styles.buttonRow}>
              <Button
                label="Cancel"
                onPress={closeModal}
                backgroundColor="#eee"
                color="#333"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                label="Confirm"
                onPress={confirmLocation}
                disabled={!address || loading}
                backgroundColor={colors.primary}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0, // Remove padding for more space
  },
  contentCard: {
    width: '90%', // Reduced width
    height: '70%', // Reduced height
    padding: 12,   // Slightly more padding for smaller card
    gap: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: 'column',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerPinContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -24,
    marginTop: -48,
    zIndex: 2,
    pointerEvents: 'none',
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 24, // Move further down and right
    right: 16,
    width: 32,  // Reduce size
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 3,
    backgroundColor: "#fff", // Invert: white background
    // borderWidth: 2, // Removed border/outline
    // borderColor: colors.primary, // Removed border color
  },
  addressContainer: {
    marginTop: 12,
    alignItems: 'center',
    minHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  confirmButton: {
    color: colors.primary,
  }
});
