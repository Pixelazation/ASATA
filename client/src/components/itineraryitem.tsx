import React from "react";
import { View, Text, Colors } from "react-native-ui-lib";
import { Row } from "./row";
import { IconButton } from "./iconbutton";

type ItineraryItemProps = {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const ItineraryItem: React.FC<ItineraryItemProps> = ({ name, location, startDate, endDate }) => {
  return (
    <View
      bg-white
      padding-s4
      br40
      marginV-s2
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        minHeight: 120,
        justifyContent: "space-between",
      }}
    >
      {/* Title and Location */}
      <View style={{ marginBottom: 20 }}>
        <Text text60M>{name}</Text>
        <Text text80L color={Colors.grey40}>{location}</Text>
      </View>

      {/* Bottom Section (Dates & Icons) */}
      <Row style={{ justifyContent: "space-between" }}>
        <Text text80L color={Colors.grey40}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </Text>

        <Row>
          <IconButton name="pencil" />
          <IconButton name="copy" />
          <IconButton name="trash" color={Colors.red30} />
        </Row>
      </Row>
    </View>
  );
};
