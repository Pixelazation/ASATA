import React, { useState } from "react";
import { Marker } from "react-native-maps";
import { View, Text, StyleSheet } from "react-native";
import { colors } from '../../utils/designSystem';
import { ActivityModal } from './activity-modal';

export const ActivityMarker = React.memo(({ activity, index }: {
  activity: any;
  index: number;
}) => {
  if (!activity.latitude || !activity.longitude) return null;

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <Marker
      coordinate={{
        latitude: activity.latitude,
        longitude: activity.longitude,
      }}
      onPress={() => setModalVisible(true)}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        <View style={styles.markerCircle}>
          <Text style={styles.markerText}>{index + 1}</Text>
        </View>
      </View>
      <ActivityModal visible={modalVisible} activityDetails={activity} closeModal={() => setModalVisible(false)} />
    </Marker>
  );
});

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 2,
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
  },
});