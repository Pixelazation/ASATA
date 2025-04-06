import React from "react";
import { View, Text, Colors } from "react-native-ui-lib";
import { ImageBackground, StyleSheet } from "react-native";
import { Row } from "./row";
import { IconButton } from "./iconbutton";
import { formatDate } from "../utils/dateutils";
import { BG_IMAGE } from '../assets';
import { Icon } from './icon';
import { useServices } from '../services';

type ItineraryItemProps = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  onDelete: () => void;
};

export const ItineraryItem: React.FC<ItineraryItemProps> = ({
  id,
  name,
  location,
  startDate,
  endDate,
  onDelete,
}) => {
  const {t, navio} = useServices();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={{fontWeight: "bold"}}>{name}</Text>
      </View>
      <ImageBackground source={BG_IMAGE} style={styles.imageContainer} imageStyle={styles.image} resizeMode="cover">
        <Row style={styles.locationContainer}>
          <Icon name="location" color={Colors.red30} size={20}/>
          <Text>{location}</Text>
        </Row>
        
        <View style={styles.bottomContainer}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
          </View>
          <Row style={styles.row}>
            <IconButton name="pencil" onPress={() => navio.push('Itinerary', {itineraryId: id})}/>
            <IconButton name="copy" />
            <IconButton name="trash" color={Colors.red30} onPress={onDelete} />
          </Row>
        </View>
      </ImageBackground>
    </View>
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

    minHeight: 160,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginVertical: 8,
    overflow: "hidden",
  },
  titleContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
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
    backgroundColor: "white",
    padding: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: "#000",
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

