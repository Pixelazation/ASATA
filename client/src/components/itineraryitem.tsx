import React from "react";
import { View, Text, Colors } from "react-native-ui-lib";
import { Row } from "./row"; 
import { Icon } from "./icon";
import { Bounceable } from "rn-bounceable";

type ItineraryItemProps = {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
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
      {/* Title and Loc */}
      <View style={{ marginBottom: 20 }}>
        <Text text60M>{name}</Text>
        <Text text80L color={Colors.grey40}>{location}</Text>
      </View>

      {/* Bottom Section (Dates & Icons) */}
      <Row style={{ justifyContent: "space-between" }}>
        {/* Dates */}
        <Text text80L color={Colors.grey40}>
          {startDate} - {endDate}
        </Text>

        {/* Icons */}
        <Row>
          <Bounceable>
            <Text>
              <Icon name="pencil" size={18} color={Colors.primary} />
            </Text>
          </Bounceable>
          <Bounceable>
            <Text>
              <Icon name="copy" size={18} color={Colors.primary} />
            </Text>
          </Bounceable>
          <Bounceable>
            <Text>
              <Icon name="trash" size={18} color={Colors.red30} />
            </Text>
          </Bounceable>
        </Row>
      </Row>
    </View>
  );
};
