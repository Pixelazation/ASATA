import React, { useState } from "react";
import { ScrollView, TextInput, Alert, Linking, TouchableOpacity } from "react-native";
import { Text, View, Button, Checkbox } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";
import { services, useServices } from "@app/services";
import { useAppearance } from "@app/utils/hooks";
import { LocationSearchApi } from "@app/services/api/locationsearch";
import { LocationDetailsApi } from "@app/services/api/locationdetails";
import { GeocodingApi } from "@app/services/api/geocoding";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Picker } from '@react-native-picker/picker';

type Location = {
  latitude: number;
  longitude: number;
};

export const GetSuggestions: NavioScreen = observer(() => {
  useAppearance();
  const { t, navio } = useServices();

  const [location, setLocation] = useState(""); // Location as editable text input
  const [selectedOption, setSelectedOption] = useState<string>(""); // Recreation or Diner
  const [selectedRecreation, setSelectedRecreation] = useState<string[]>([]);
  const [selectedDiner, setSelectedDiner] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null); // Store the selected pin location

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
    if (!location.trim()) {
      Alert.alert("Error", "Please enter a location or select a location on the map.");
      return;
    }

    setLoading(true);
    try {
      let category = "";
      if (selectedOption === "recreation") {
        category = "attractions"; // Recreation -> Attractions
      } else if (selectedOption === "diner") {
        category = "restaurants"; // Diner -> Restaurants
      }

      let query = location; // If location is typed by the user

      if (!selectedLocation && location.trim()) {
        // If the user typed a location, pass the typed location + filters to the query
        query = `${location} ${selectedOption === "recreation" ? selectedRecreation.join(", ") : selectedDiner.join(", ")}`;
      } else if (selectedLocation) {
        // If location is selected on the map, update the location to route, city, country format
        const geocodeResult = await GeocodingApi.reverseGeocode(selectedLocation.latitude, selectedLocation.longitude);
        if (geocodeResult) {
          const { route, city, country } = geocodeResult;
          query = `${route}, ${city}, ${country} ${selectedOption === "recreation" ? selectedRecreation.join(", ") : selectedDiner.join(", ")}`;
        }
      }

      // Call the API with the dynamically created query
      const data = await LocationSearchApi.search(query, category); // Pass category dynamically
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

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);

    const result = await GeocodingApi.reverseGeocode(coordinate.latitude, coordinate.longitude);
    if (result) {
      const { route, city, country } = result;
      setLocation(`${route}, ${city}, ${country}`);
    }
  };

  const handleLocationChange = (text: string) => {
    setLocation(text); // Update location on text change
    setSelectedLocation(null); // Remove the pin if user is typing
  };

  return (
    <View flex bg-bgColor padding-s3>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <Text text50 marginB-s2>Get Suggestions</Text>

        {/* Map Component */}
        <MapView
          provider={PROVIDER_DEFAULT}
          style={{ height: 300, marginBottom: 10 }}
          initialRegion={{
            latitude: 37.78825,
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

        {/* Display geocoded city name */}
        <TextInput
          placeholder="Location"
          value={location}
          onChangeText={handleLocationChange} // Update location when typing
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
        />

        {/* Dropdown for selecting Recreation or Diner */}
        <Picker
          selectedValue={selectedOption}
          onValueChange={(itemValue) => setSelectedOption(itemValue)}
          style={{ marginBottom: 10 }}
        >
          <Picker.Item label="Select Category" value="" />
          <Picker.Item label="Recreation" value="recreation" />
          <Picker.Item label="Diner" value="diner" />
        </Picker>

        {/* Show recreation filters if Recreation is selected */}
        {selectedOption === "recreation" && (
          <View>
            <Text text60 marginB-s2>Choose Recreation Types</Text>
            {recreationOptions.map(option => (
              <Checkbox
                key={option}
                label={option}
                value={selectedRecreation.includes(option)}
                onValueChange={() => toggleSelection(option, "recreation")}
              />
            ))}
          </View>
        )}

        {/* Show diner filters if Diner is selected */}
        {selectedOption === "diner" && (
          <View>
            <Text text60 marginB-s2>Choose Diner Types</Text>
            {dinerOptions.map(option => (
              <Checkbox
                key={option}
                label={option}
                value={selectedDiner.includes(option)}
                onValueChange={() => toggleSelection(option, "diner")}
              />
            ))}
          </View>
        )}

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
    </View>
  );
});

GetSuggestions.options = {
  title: "Get Suggestions",
};
