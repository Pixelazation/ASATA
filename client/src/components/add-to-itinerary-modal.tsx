import React, { useState, useEffect } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { ItineraryApi } from "@app/services/api/itineraries";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectItinerary: (itinerary: ItineraryType) => void;
}

export const ItinerarySelectorModal: React.FC<Props> = ({ visible, onClose, onSelectItinerary }) => {
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.modalContainer}>
        <Text style={styles.header}>Select an Itinerary</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Loading itineraries...</Text>
          ) : itineraries.length === 0 ? (
            <Text style={styles.emptyText}>No itineraries found.</Text>
          ) : (
            itineraries.map((itinerary) => (
              <TouchableOpacity
                key={itinerary.id}
                style={styles.itineraryItem}
                onPress={() => {
                  onSelectItinerary(itinerary);
                  onClose();
                }}
              >
                <Text style={styles.itineraryTitle}>{itinerary.title}</Text>
                <Text style={styles.itineraryLocation}>
                  {itinerary.location || "No location specified"}
                </Text>
              </TouchableOpacity>
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
