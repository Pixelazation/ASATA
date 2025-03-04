import React from "react";
import { View, Text, Colors } from "react-native-ui-lib";
import { Row } from "./row";
import { IconButton } from "./iconbutton";

type ItineraryItemProps = {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  onDelete: () => void;
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const ItineraryItem: React.FC<ItineraryItemProps> = ({
  name,
  location,
  startDate,
  endDate,
  onDelete,
}) => {
  return (
    <View
      bg-white
      padding-s3
      marginV-s2
      style={{
        width: "85%",
        alignSelf: "center",

        // ios shadows (i have no way to test this kay di ko iphone)
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },

        // apparently this is the only shadow controller for android
        elevation: 7,

        minHeight: 130,
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 4,
      }}
    >
      {/* Title and Location */}
      <View style={{ marginBottom: 20 }}>
        <Text text60M style={{ color: "#000" }}>{name}</Text>
        <Text text80L style={{ color: "#000" }}>{location}</Text>
      </View>

      {/* Bottom Section (Dates & Icons) */}
      <Row style={{ justifyContent: "space-between" }}>
        <Text text80L style={{ color: "#000" }}>
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
