import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AddFilterModal } from "./add-filter-modal";
import { colors } from "../utils/designSystem";

type Props = {
  filters: string[];
  selected: string[];
  onToggle: (label: string) => void;
  onAdd: (label: string) => void;
};

export const FilterChipAddBar: React.FC<Props> = ({
  filters,
  selected,
  onToggle,
  onAdd,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.row}>
      {filters.map((label) => (
        <TouchableOpacity
          key={label}
          style={[
            styles.chip,
            selected.includes(label) ? styles.chipSelected : styles.chipUnselected,
          ]}
          onPress={() => onToggle(label)}
          activeOpacity={0.8}
        >
          {selected.includes(label) && (
            <MaterialIcons
                name="check"
                size={16}
                color="#fff"
                style={{ marginRight: 4 }}
            />
         )}
          <Text
            style={[
              styles.chipText,
              selected.includes(label) && styles.chipTextSelected,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.plusChip}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={24} color={colors.primary} />
      </TouchableOpacity>
      <AddFilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={onAdd}
      />
    </View>
  );
};

import { Text } from "react-native-ui-lib";
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipUnselected: {
    backgroundColor: "#d4edda",
  },
  chipSelected: {
    backgroundColor: "#155724",
  },
  chipText: {
    fontSize: 14,
    color: "#155724",
  },
  chipTextSelected: {
    color: "#fff",
  },
  plusChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d4edda",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
});