import React from "react";
import { View, Text, Colors } from "react-native-ui-lib";
import { ImageBackground, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Row } from "./row";
import { IconButton } from "./iconbutton";
import { timestampToDateString } from "../utils/dateutils";
import { BG_IMAGE_2 } from '../assets';
import { Icon } from './icon';
import { useServices } from '../services';
import { colors } from '../utils/designSystem';

type ItineraryItemProps = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
  onDelete?: () => void; // Make optional
  onPress?: () => void;  // <-- Add this line
  hideDelete?: boolean;  // <-- Add this line
};

export const ItineraryItem: React.FC<ItineraryItemProps> = ({
  id,
  name,
  location,
  startDate,
  endDate,
  imageUrl,
  onDelete,
  onPress,
  hideDelete,
}) => {
  const { t, navio } = useServices();

  const handlePress = onPress
    ? onPress
    : () => navio.push('Itinerary', { itineraryId: id });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={styles.titleContainer}>
        <Text style={{ fontWeight: "bold" }}>{name}</Text>
      </View>
      <ImageBackground
        source={imageUrl ? { uri: imageUrl } : BG_IMAGE_2}
        style={styles.imageContainer}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        <Row style={styles.locationContainer}>
          <Icon name="location" color={Colors.red30} size={20} />
          <Text>{location}</Text>
        </Row>

        <View style={styles.bottomContainer}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {timestampToDateString(startDate)} - {timestampToDateString(endDate)}
            </Text>
          </View>
          {!hideDelete && (
            <Row style={styles.row}>
              <IconButton name="pencil" onPress={() => navio.push('ItineraryForm', { itineraryId: id })} />
              <IconButton name="copy" />
              <IconButton name="trash" color={Colors.red30} onPress={onDelete} />
            </Row>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    width: "85%",
    alignSelf: "center",

    // iOS Shadows
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 4 },

    // Android Shadow
    elevation: 5,

    minHeight: 200,
    justifyContent: "space-between",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginVertical: 8,
    overflow: "hidden",
  },
  titleContainer: {
    backgroundColor: colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    padding: 8,
  },
  locationContainer: {
    padding: 4,
    gap: 8,
  },
  image: {
    opacity: 0.4,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  bottomContainer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    backgroundColor: colors.secondary,
    padding: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderTopRightRadius: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-around",
    gap: 12,
    paddingRight: 8,
  },
});

