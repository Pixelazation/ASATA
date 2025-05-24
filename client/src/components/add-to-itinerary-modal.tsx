import React, { useState, useEffect } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { ItineraryApi } from "@app/services/api/itineraries";
import { ItineraryItem } from "./itineraryitem"; // Adjust path if needed
import { MaterialIcons } from '@expo/vector-icons'; // or your icon lib
import { Alert } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectItinerary: (itinerary: ItineraryType) => void;
  onCreateNew?: () => void; // <-- add this
}

export const ItinerarySelectorModal: React.FC<Props> = ({ visible, onClose, onSelectItinerary, onCreateNew }) => {
  const [itineraries, setItineraries] = useState<ItineraryType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchUserItineraries();
    }
  }, [visible]);

  const fetchUserItineraries = async () => {
    setLoading(true);
    try {
      const data = await ItineraryApi.getItineraries();
      setItineraries(data);
    } catch (error) {
      console.error("Failed to fetch itineraries:", error);
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  };

  function alert(message: string): void {
    // Use React Native's Alert API to show a simple alert dialog
    Alert.alert("Alert", message);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.modalContainer}>
        <Text style={styles.header}>Select an Itinerary</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* --- Add to New Itinerary Button --- */}
          <TouchableOpacity
            style={[styles.itineraryItem, styles.createNewItinerary]}
            onPress={() => {
              onClose();
              onCreateNew && onCreateNew();
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={32} color="#007AFF" style={{ marginRight: 12 }} />
            <Text style={styles.createNewText}>Create New Itinerary from Activity</Text>
          </TouchableOpacity>
          {/* --- Existing Itineraries --- */}
          {loading ? (
            <Text style={styles.loadingText}>Loading itineraries...</Text>
          ) : itineraries.length === 0 ? (
            <Text style={styles.emptyText}>No itineraries found.</Text>
          ) : (
            itineraries.map((itinerary) => (
              <ItineraryItem
                key={itinerary.id}
                id={itinerary.id}
                name={itinerary.title}
                location={itinerary.location || "No location specified"}
                startDate={itinerary.start_date}
                endDate={itinerary.end_date}
                imageUrl={itinerary.image_url}
                onPress={() => {
                  onSelectItinerary(itinerary);
                  onClose();
                }}
                hideDelete
              />
            ))
          )}
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  createNewItinerary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
    justifyContent: 'center',
  },
  createNewText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  itineraryItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  itineraryLocation: {
    fontSize: 14,
    color: "#666",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "center",
    padding: 10,
  },
  closeText: {
    color: "blue",
    fontSize: 16,
  },
});
