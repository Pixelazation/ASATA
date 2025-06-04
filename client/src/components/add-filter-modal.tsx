import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Modal } from "react-native";
import { View, Text, TouchableOpacity, TextField } from "react-native-ui-lib";
import { colors } from "../utils/designSystem";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (label: string) => void;
};

export const AddFilterModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput("");
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <Text style={styles.title}>Add Custom Filter</Text>
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.inputRow}>
            <TextField
              style={styles.input}
              placeholder="Enter filter label"
              value={input}
              onChangeText={setInput}
              autoFocus
              enableErrors={false}
              hideUnderline
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              containerStyle={{ flex: 1 }}
            />
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!input.trim()}
              style={[
                styles.enterIcon,
                { backgroundColor: input.trim() ? colors.primary : "#b2d8c6" }
              ]}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    width: "80%",
    elevation: 5,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
    width: 32,
    alignItems: "flex-start",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  input: {
    fontSize: 16,
    paddingRight: 8,
  },
  enterIcon: {
    padding: 4,
    borderRadius: 20,
    marginLeft: 4,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});