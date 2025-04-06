import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, Alert, Modal } from "react-native";
import { Text, View, Colors, Button, Checkbox } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";
import { services, useServices } from "@app/services";
import { useAppearance } from "@app/utils/hooks";
import { LocationSearchApi } from "@app/services/api/locationsearch";
import { LocationDetailsApi } from "@app/services/api/locationdetails"; // ✅ ADDED

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
      Alert.alert("Error", "Please enter a location.");
      return;
    }

    setLoading(true);
    try {
      const searchQuery = [location, ...selectedRecreation, ...selectedDiner].join(", ");
      const data = await LocationSearchApi.search(searchQuery, "attractions");
      const results = data?.data || [];

      // ✅ ENRICH WITH LOCATION DETAILS
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

  return (
    <View flex bg-bgColor padding-s3>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <Text text50 marginB-s2>Get Suggestions</Text>
        <TextInput 
          placeholder="Enter location"
          value={location}
          onChangeText={setLocation}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
        />
        <Button label="Recreation" marginB-s2 onPress={() => setShowRecreationModal(true)} />
        <Button label="Diner" marginB-s2 onPress={() => setShowDinerModal(true)} />
        <Button label="Get Suggestions" onPress={fetchSuggestions} marginB-s2 disabled={loading} />
        {loading ? (
          <Text text70M>Loading suggestions...</Text>
        ) : (
          suggestions.map((item, index) => (
            <View
              key={index}
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
                marginBottom: 15,
              }}
            >
              <Text text70M>{item.name}</Text>
              <Text text80>{item.address_obj?.address_string}</Text>
              <Text text80>Rating: {item.rating ?? "N/A"}</Text>
              <Text text80>Ranking: {item.ranking_data?.ranking_string ?? "N/A"}</Text>
              <Text text80 numberOfLines={1} ellipsizeMode="tail">
                {item.web_url}
              </Text>
            </View>
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
              onValueChange={() => toggleSelection(option, 'recreation')} 
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
              onValueChange={() => toggleSelection(option, 'diner')} 
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
