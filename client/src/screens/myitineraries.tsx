import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Modal, View as RNView } from "react-native";
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
  const [fabDisabled, setFabDisabled] = useState(false); // Add this state

  // Modal state for delete confirmation
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      configureUI();
      fetchItineraries();
      setFabDisabled(false); // Re-enable FAB when returning to this screen
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
      setItineraries(data);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      setItineraries([]);
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

  // Handler to prevent multiple form opens
  const handleFabPress = () => {
    if (fabDisabled) return;
    setFabDisabled(true);
    navio.push("ItineraryForm", { itineraryId: undefined });
  };

  // Handler for delete with confirmation
  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId) {
      await deleteItinerary(pendingDeleteId);
      setPendingDeleteId(null);
      setDeleteModalVisible(false);
    }
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
    setDeleteModalVisible(false);
  };

  return (
    <View flex bg-bgColor style={styles.screen}>
      <Text section style={styles.header}>My Itineraries</Text>
      <ScrollView contentContainerStyle={{paddingBottom:100}} contentInsetAdjustmentBehavior="always">
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <ActivityIndicator size={120} color={colors.primary} />
            <Text style={{ textAlign: 'center', marginTop: 16 }}>Fetching itineraries</Text>
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
              onDelete={() => handleDeleteRequest(itinerary.id)}
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
        loading={fabDisabled} // <-- Show spinner when disabled
        disabled={fabDisabled}
        onPress={handleFabPress}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <RNView style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.35)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <RNView style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            width: '85%',
            alignItems: 'center'
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: colors.primary }}>
              Delete Itinerary?
            </Text>
            <Text style={{ color: '#444', marginBottom: 16, textAlign: 'center' }}>
              Are you sure you want to delete this itinerary? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Button
                label="Cancel"
                backgroundColor="#eee"
                color="#333"
                style={{ flex: 1, marginRight: 6 }}
                onPress={handleCancelDelete}
              />
              <Button
                label="Delete"
                backgroundColor={colors.primary}
                color="white"
                style={{ flex: 1, marginLeft: 6 }}
                onPress={handleConfirmDelete}
              />
            </View>
          </RNView>
        </RNView>
      </Modal>
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