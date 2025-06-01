import React, { useState } from "react";
import { View, Text, Colors } from "react-native-ui-lib";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import { timestampToDateString } from "../utils/dateutils";
import { BG_IMAGE_2 } from "../assets";
import { Icon } from "./icon";
import { useServices } from "../services";
import { colors } from "../utils/designSystem";

type ItineraryItemProps = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
  onDelete?: () => void;
  onPress?: () => void;
  hideDelete?: boolean;
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
  const [showOptions, setShowOptions] = useState(false);

  const handlePress = onPress
    ? onPress
    : () => navio.push("Itinerary", { itineraryId: id });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={styles.container}
    >
      <Image
        source={imageUrl ? { uri: imageUrl } : BG_IMAGE_2}
        resizeMode="cover"
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{name}</Text>
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)} onBlur={() => setShowOptions(false)}>
            <Icon name="ellipsis-horizontal" color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Icon name="location" color={Colors.red30} size={18} />
          <Text style={styles.location}>{location}</Text>
        </View>

        <Text style={styles.date}>
          {timestampToDateString(startDate)} - {timestampToDateString(endDate)}
        </Text>

        <Modal
          visible={showOptions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptions(false)}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowOptions(false)}
          />
          <View style={[styles.optionsDropdownContainer]}>
            <View style={styles.optionsDropdown}>
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false);
                  navio.push("ItineraryForm", { itineraryId: id });
                }}
              >
                <Text style={styles.option}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false);
                  navio.push("ItineraryForm", { duplicateId: id });
                }}
              >
                <Text style={styles.option}>Duplicate</Text>
              </TouchableOpacity>
              {!hideDelete && (
                <TouchableOpacity
                  onPress={() => {
                    setShowOptions(false);
                    onDelete?.();
                  }}
                >
                  <Text style={[styles.option, { color: Colors.red30 }]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "85%",
    alignSelf: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginVertical: 8,
    overflow: "hidden",
  },
  optionsDropdownContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 999,
  },
  image: {
    width: "40%",
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.grey30,
  },
  date: {
    fontSize: 13,
    color: Colors.grey40,
    marginTop: 8,
  },
  optionsDropdown: {
    position: "absolute",
    right: 0,
    top: 32,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 999,
  },
  option: {
    paddingVertical: 6,
    fontSize: 14,
    color: Colors.black,
  },
});
