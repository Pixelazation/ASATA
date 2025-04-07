import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, Alert, Modal, Linking, TouchableOpacity } from "react-native";
import { Text, View, Colors, Button, Checkbox } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";
import { services, useServices } from "@app/services";
import { useAppearance } from "@app/utils/hooks";
import { LocationSearchApi } from "@app/services/api/locationsearch";
import { LocationDetailsApi } from "@app/services/api/locationdetails";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

// Define a type for selected location
type Location = {
  latitude: number;
  longitude: number;
};

export const GetSuggestions: NavioScreen = observer(() => {
  useAppearance();
  const { t, navio } = useServices();

  const [location, setLocation] = useState("");
  const [selectedRecreation, setSelectedRecreation] = useState<string[]>([]);
  const [selectedDiner, setSelectedDiner] = useState<string[]>([]);
  const [showRecreationModal, setShowRecreationModal] = useState(false);
  const [showDinerModal, setShowDinerModal] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Map-related states
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null); // Store selected pin

  const recreationOptions = ["Wildlife", "Adventure", "Beaches", "Museums", "Hiking", "Parks"];
  const dinerOptions = ["Fast Food", "Fine Dining", "Cafés", "Buffets", "Local Cuisine"];

  const toggleSelection = (item: string, type: "recreation" | "diner") => {
    if (type === "recreation") {
      setSelectedRecreation(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else {
      setSelectedDiner(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }
  };

  const fetchSuggestions = async () => {
    if (!location.trim() && !selectedLocation) {
      Alert.alert("Error", "Please enter a location or select a location on the map.");
      return;
    }

    setLoading(true);
    try {
      // Use the selectedLocation coordinates if available, otherwise use the location input
      const searchQuery = selectedLocation
        ? `${selectedLocation.latitude}, ${selectedLocation.longitude}`
        : location;

      const data = await LocationSearchApi.search(searchQuery, "attractions");
      const results = data?.data || [];

      const detailedResults = await Promise.all(
        results.map(async (item: any) => {
          try {
            const details = await LocationDetailsApi.getDetails(Number(item.location_id));
            return details ?? item;
          } catch {
            return item;
          }
        })
      );

      setSuggestions(detailedResults);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate); // Set selected pin's coordinates
    setLocation(""); // Clear the input when pin is selected
  };

  return (
    <View flex bg-bgColor padding-s3>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <Text text50 marginB-s2>Get Suggestions</Text>

        {/* Map Component */}
        <MapView
          provider={PROVIDER_DEFAULT}  // Default map provider
          style={{ height: 300, marginBottom: 10 }}
          initialRegion={{
            latitude: 37.78825,  // Default to some initial coordinates
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleMapPress}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Selected Location"
            />
          )}
        </MapView>

        {/* Display location as text after selecting on the map */}
        <TextInput
          placeholder="Location"
          value={selectedLocation ? `${selectedLocation.latitude}, ${selectedLocation.longitude}` : location}
          editable={false}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
        />

        <Button label="Recreation" marginB-s2 onPress={() => setShowRecreationModal(true)} />
        <Button label="Diner" marginB-s2 onPress={() => setShowDinerModal(true)} />
        <Button label="Get Suggestions" onPress={fetchSuggestions} marginB-s2 disabled={loading} />
        {loading ? (
          <Text text70M>Loading suggestions...</Text>
        ) : (
          suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (item.web_url) {
                  Linking.openURL(item.web_url);
                }
              }}
              style={{
                padding: 16,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 12,
                marginBottom: 15,
                backgroundColor: "#fff",
              }}
            >
              <Text text60BO marginB-s1>{item.name}</Text>
              <Text text70 marginB-s1>{item.address_obj?.address_string}</Text>
              <Text>
                {Array.from({ length: Math.round(Number(item.rating) || 0) }, () => "⭐").join("") || "No rating"}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Recreation Modal */}
      <Modal visible={showRecreationModal} animationType="slide" transparent>
        <View flex center bg-white padding-s4>
          <Text text60 marginB-s2>Choose Recreation Types</Text>
          {recreationOptions.map(option => (
            <Checkbox
              key={option}
              label={option}
              value={selectedRecreation.includes(option)}
              onValueChange={() => toggleSelection(option, "recreation")}
            />
          ))}
          <Button label="Close" marginT-s4 onPress={() => setShowRecreationModal(false)} />
        </View>
      </Modal>

      {/* Diner Modal */}
      <Modal visible={showDinerModal} animationType="slide" transparent>
        <View flex center bg-white padding-s4>
          <Text text60 marginB-s2>Choose Diner Types</Text>
          {dinerOptions.map(option => (
            <Checkbox
              key={option}
              label={option}
              value={selectedDiner.includes(option)}
              onValueChange={() => toggleSelection(option, "diner")}
            />
          ))}
          <Button label="Close" marginT-s4 onPress={() => setShowDinerModal(false)} />
        </View>
      </Modal>
    </View>
  );
});

GetSuggestions.options = {
  title: "Get Suggestions",
};
