import React from "react";
import { View, Text, Colors } from "react-native-ui-lib";
import { StyleSheet } from "react-native";
import { Row } from "./row";
import { IconButton } from "./iconbutton";
import { formatDate } from "../utils/dateutils";

type ItineraryItemProps = {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  onDelete: () => void;
};

export const ItineraryItem: React.FC<ItineraryItemProps> = ({
  name,
  location,
  startDate,
  endDate,
  onDelete,
}) => {
  return (
    <View style={styles.container}>
      {/* Title and Location */}
      <View style={styles.titleContainer}>
        <Text text60M style={styles.text}>{name}</Text>
        <Text text80L style={styles.text}>{location}</Text>
      </View>

      {/* Bottom Section (Dates & Icons) */}
      <Row style={styles.row}>
        <Text text80L style={styles.text}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </Text>

        <Row>
          <IconButton name="pencil" />
          <IconButton name="copy" />
          <IconButton name="trash" color={Colors.red30} onPress={onDelete} />
        </Row>
      </Row>
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
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },

    // Android Shadow
    elevation: 7,

    minHeight: 130,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 8,
  },
  titleContainer: {
    marginBottom: 20,
  },
  text: {
    color: "#000",
  },
  row: {
    justifyContent: "space-between",
  },
});

