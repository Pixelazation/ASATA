import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { View, Text, Button, Modal } from 'react-native-ui-lib';
import { GeocodingApi } from '../../services/api/geocoding';
import { colors } from '../../utils/designSystem';

type Props = {
  location?: string;
  setLocation?: (loc: string, long: number, lat: number) => void;
  visible: boolean;
  closeModal: () => void;
};

export const MapModal: React.FC<Props> = ({
  location,
  setLocation,
  visible,
  closeModal,
}) => {
  const mapRef = useRef<MapView>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedCoords({ lat: latitude, lng: longitude });
    setLoading(true);
    const result = await GeocodingApi.reverseGeocode(latitude, longitude);
    if (result) setAddress(result.fullAddress);
    else setAddress('Unknown location');
    setLoading(false);
  };

  const confirmLocation = () => {
    if (setLocation && address && selectedCoords) {
      setLocation(address, selectedCoords.lng, selectedCoords.lat);
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
                onPress={handleMapPress}
                initialRegion={{
                  latitude: 10.3157,
                  longitude: 123.8854,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                {selectedCoords && (
                  <Marker coordinate={{ latitude: selectedCoords.lat, longitude: selectedCoords.lng }} />
                )}
              </MapView>
            </View>

            <View style={styles.addressContainer}>
              {loading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text style={{fontWeight: 'bold'}}>{address || 'Tap a location on the map'}</Text>
              )}
            </View>

            <Button
              label="Confirm Location"
              onPress={confirmLocation}
              disabled={!address || loading}
              backgroundColor={colors.primary}
            />
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
    padding: 16,
  },
  contentCard: {
    width: '90%',
    height: '80%',
    padding: 16,
    gap: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: 'column',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addressContainer: {
    marginTop: 12,
    alignItems: 'center',
    minHeight: 24,
  },
  confirmButton: {
    color: colors.primary,
  }
});
