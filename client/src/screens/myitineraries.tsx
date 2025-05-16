import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet } from "react-native";
import { Text, View, Button, Colors } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";

import { services, useServices } from "@app/services";
import { useAppearance } from "@app/utils/hooks";
import { ItineraryItem } from "../components/itineraryitem";
import { ItineraryApi } from "@app/services/api/itineraries";
import { IconButton } from "../components/iconbutton";
import { colors } from '../utils/designSystem';
import { FloatingActionButton } from '../components/atoms/floating-action-button';
import { useFocusEffect } from '@react-navigation/native';
import { CHIBI_EMPTY } from '../assets';
import { Activity } from '../components/activity';

export type Params = {
  itineraryId?: string;
};

export const MyItineraries: NavioScreen = observer(() => {
  useAppearance(); // Enables dark mode handling
  const { t, navio } = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  const [itineraries, setItineraries] = useState<ItineraryType[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      configureUI();
      fetchItineraries();
    }, [])
  )

  const configureUI = () => {
    navigation.setOptions({});
  };

  // Fetch Itineraries from Supabase
  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const data = await ItineraryApi.getItineraries();
      console.log("Fetched itineraries:", data); // Debugging log
      setItineraries(data);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Add Dummy
  const addDummyItinerary = async () => {
    try {
      const newItinerary = {
        title: "Test Trip",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
        budget: 500,
        location: "Unknown Location",
      };

      await ItineraryApi.addItinerary(newItinerary);
      fetchItineraries(); // Fetch updated itineraries after adding
    } catch (error) {
      console.error("Error adding itinerary:", error);
    }
  };

  // Delete Itinerary
  const deleteItinerary = async (id: string) => {
    try {
      await ItineraryApi.deleteItinerary(id);
      setItineraries((prev) => prev.filter((itinerary) => itinerary.id !== id)); // Optimistic update
    } catch (error) {
      console.error("Error deleting itinerary:", error);
    }
  };

  return (
    <View flex bg-bgColor style={styles.screen}>
      <Text section style={styles.header}>My Itineraries</Text>
      <ScrollView contentContainerStyle={{flex: 1, flexGrow: 1}} contentInsetAdjustmentBehavior="always">
        {loading ? (
          <View style={{ flex: 1, flexGrow: 1, gap: 16, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={120} color={colors.primary} />
            <Text style={{ textAlign: 'center' }}>Fetching itineraries</Text>
          </View>
        ) : itineraries.length > 0 ? (
          itineraries.map((itinerary) => (
            <ItineraryItem
              key={itinerary.id}
              id={itinerary.id}
              name={itinerary.title}
              location={itinerary.location || "No location specified"}
              startDate={itinerary.start_date}
              endDate={itinerary.end_date}
              imageUrl={itinerary.image_url}
              onDelete={() => deleteItinerary(itinerary.id)}
            />
          ))
        ) : (
          <View style={{ flex: 1, flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 64 }}>
            <Image source={CHIBI_EMPTY} style={{ height: 400, aspectRatio: 1, alignSelf: "center" }} />
            <View style={{ padding: 32 }}>
              <Text style={{fontWeight: 'bold', textAlign: 'center'}}>Oops! No Itineraries Yet!</Text>
              <Text style={{textAlign: 'center'}}>
                Start planning your adventure by pressing the + button!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="add"
        onPress={() => navio.push("ItineraryForm")}
      />
    </View>
  );
});

MyItineraries.options = {
  headerShown: false,
  title: "My Itineraries",
};

const styles = StyleSheet.create({
  screen: {
    marginTop: 32,
  },
  header: {
    padding: 16,
    letterSpacing: 1.25
  },
});