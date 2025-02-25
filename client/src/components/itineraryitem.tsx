import React from "react";
import { View, Text, TouchableOpacity } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons"; // If using react-native-vector-icons

type ItineraryItemProps = {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
};

export const ItineraryItem: React.FC<ItineraryItemProps> = ({ name, location, startDate, endDate }) => {
  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        marginVertical: 8,
        position: "relative",
      }}
    >
      {/* Itinerary Name and Location */}
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>{name}</Text>
      <Text style={{ fontSize: 14, color: "gray", marginBottom: 8 }}>{location}</Text>

      {/* Dates */}
      <Text style={{ fontSize: 12, color: "gray", position: "absolute", bottom: 10, left: 16 }}>
        {startDate} - {endDate}
      </Text>

      {/* Icons */}
      <View style={{ position: "absolute", bottom: 8, right: 16, flexDirection: "row", gap: 8 }}>
        <TouchableOpacity>
          <Text>
            <Feather name="edit" size={14} color="gray" />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>
            <Feather name="copy" size={14} color="gray" />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>
            <Feather name="trash-2" size={14} color="red" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
