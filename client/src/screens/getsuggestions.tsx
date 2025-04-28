import React, { useState } from "react";
import { ScrollView, TextInput, Alert, Linking, TouchableOpacity, StyleSheet } from "react-native";
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

  const [location, setLocation] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedRecreation, setSelectedRecreation] = useState<string[]>([]);
  const [selectedDiner, setSelectedDiner] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

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
        category = "attractions";
      } else if (selectedOption === "diner") {
        category = "restaurants";
      }

      let query = location;

      if (!selectedLocation && location.trim()) {
        query = `${location} ${selectedOption === "recreation" ? selectedRecreation.join(", ") : selectedDiner.join(", ")}`;
      } else if (selectedLocation) {
        const geocodeResult = await GeocodingApi.reverseGeocode(selectedLocation.latitude, selectedLocation.longitude);
        if (geocodeResult) {
          const { route, city, country } = geocodeResult;
          query = `${route}, ${city}, ${country} ${selectedOption === "recreation" ? selectedRecreation.join(", ") : selectedDiner.join(", ")}`;
        }
      }

      const data = await LocationSearchApi.search(query, category);
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
    setLocation(text);
    setSelectedLocation(null);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
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

      {/* Floating Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          placeholder="Search Location"
          value={location}
          onChangeText={handleLocationChange}
          style={styles.searchBar}
        />
      </View>

      {/* Sliding Panel */}
      <View style={styles.slidingPanel}>
        <ScrollView contentInsetAdjustmentBehavior="always">
          <Text text50 marginB-s2>Get Suggestions</Text>

          <Picker
            selectedValue={selectedOption}
            onValueChange={(itemValue) => setSelectedOption(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            <Picker.Item label="Recreation" value="recreation" />
            <Picker.Item label="Diner" value="diner" />
          </Picker>

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
                style={styles.suggestionCard}
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
    </View>
  );
});

GetSuggestions.options = {
  title: "Get Suggestions",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchBar: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    fontSize: 16,
  },
  slidingPanel: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    marginTop: 200,
  },
  picker: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
  suggestionCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
});

