import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Image, ImageBackground, Pressable, ScrollView, StyleSheet} from 'react-native';
import {Text, View} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';
import SlidingUpPanel from 'rn-sliding-up-panel';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import { BG_IMAGE_2, CHIBI_EMPTY } from '../../assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity } from '../../components/activity';
import { LineProgressHead } from '../../components/atoms/line-progress-head';
import { IconButton } from '../../components/iconbutton';
import { FloatingActionButton } from '../../components/atoms/floating-action-button';
import { ItineraryApi } from '../../services/api/itineraries';
import { FloatingActionMenu } from '../../components/molecules/floating-action-menu';
import { useFocusEffect } from '@react-navigation/native';
import { HeaderBack } from '../../components/molecules/header-back';
import { colors } from '../../utils/designSystem';

export type Params = {
  type?: 'push' | 'show';
  itineraryId: string;
};

export const Itinerary: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const {t, navio} = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  const { itineraryId } = params;

  // State
  const [panelRef, setPanelRef] = useState<SlidingUpPanel | null>();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState<boolean>(false);

  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [details, setDetails] = useState<ItineraryType>();

  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  // Methods
  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await ItineraryApi.getItineraryDetails(itineraryId);
      console.log("Fetched itinerary:", data); // Debugging log
      setDetails(data);
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await ItineraryApi.getActivities(itineraryId);
      console.log("Fetched activities:", data); // Debugging log
      setActivities(data);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDummyActivity = async () => {
    try {
      const newActivity = {
        name: "Test Activity",
        start_time: new Date(),
        end_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
        cost: 500,
        category: "recreation",
        location: "Cebu",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      };

      await ItineraryApi.addActivity(itineraryId, newActivity);
      fetchActivities(); // Fetch updated itineraries after adding
    } catch (error) {
      console.error("Error adding itinerary:", error);
    }
  };

  const deleteActivity = async (id: string) => {
    if (id) {
      ItineraryApi.deleteActivity(id)
        .then(() => {
          console.log("Deleted activity:", id); // Debugging log
          fetchActivities(); // Fetch updated activities after deleting
        })
        .catch((error) => {
          console.error("Error deleting activity:", error);
        });
    }
  }

  const toggleTrack = async () => {
    try {
      if (tracked) {
        await ItineraryApi.untrackItinerary();
        console.log('Itinerary untracked successfully.');
      } else {
        await ItineraryApi.trackItinerary(itineraryId);
        console.log('Itinerary tracked successfully.');
      }
      
      checkTracked();
      panelRef?.hide();
    } catch (error) {
      console.error('Error tracking itinerary:', error);
    }
  };

  const checkTracked = async () => {
    const trackedId = await ItineraryApi.fetchTrackedItinerary();
    setTracked(trackedId == itineraryId);
  }

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  }

  useFocusEffect(
    useCallback(() => {
      configureUI();
      fetchActivities();
      fetchDetails();
      checkTracked();
      getUserLocation();
    }, [])
  );

  // UI Methods
  const configureUI = () => {
    navigation.setOptions({});
  };

  const activityList = activities.map((activity, index) => (
    <Activity key={index} activity={activity} editMode={editMode} handleDelete={deleteActivity} />
  ))

  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        {loading ? (
          <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <ActivityIndicator size={120} color={colors.primary} />
            <Text style={{ textAlign: 'center' }}>Loading itinerary</Text>
          </View>
        ) : (
          // <ImageBackground source={details?.image_url ? {uri: details.image_url} : BG_IMAGE_2} resizeMode='cover'>
          <View style={{ height: '60%', width: '100%' }}>
            <MapView
              style={{ height: '90%', width: '100%', position: 'absolute' }}
              showsUserLocation
              pointerEvents='none'
              initialRegion={{
                latitude: 10.3157,
                longitude: 123.8854,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              region={
                userLocation
                  ? {
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }
                  : undefined
              }
            >
              {/* {activities.map((activity, index) => (
                activity.latitude && activity.longitude && (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: activity.latitude,
                      longitude: activity.longitude,
                    }}
                    title={activity.name}
                    description={activity.location}
                  />
                )
              ))} */}
            </MapView>
            <View style={styles.header}>
              <HeaderBack />
              <View style={styles.headerButton}>
                <IconButton
                  name={editMode ? 'eye' : 'pencil'}
                  onPress={() => setEditMode(!editMode)}
                />
              </View>
            </View>
            <View style={{flex: 1}}>
              <SlidingUpPanel containerStyle={styles.container} ref={c => setPanelRef(c)} draggableRange={{top: 350, bottom: 50}} snappingPoints={[50, 350]} friction={0.5}>
                {activities.length > 0 ? (
                  <View style={{flex: 1, padding: 16}}>
                    <Pressable style={styles.dragHandleBar} />
                    <Pressable style={{paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text section>{details?.title}</Text>
                      {editMode && <IconButton name="pencil" onPress={() => navio.push('ItineraryForm', {itineraryId})}/>}
                    </Pressable>
                    <ScrollView contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
                      <View>
                        <View style={{flexDirection: 'row', gap: 8}}>
                          <LineProgressHead />
                          <View style={{marginBottom: 16}}>
                            <Text section>In {details?.location}</Text>
                          </View>
                        </View>
                        <View style={{paddingBottom: 64}}>
                          {activityList}
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                ) : (
                  <View style={{flex: 1, padding: 16}}>
                    <View style={styles.dragHandleBar} />
                    <View style={{paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text section>{details?.title}</Text>
                      {editMode && <IconButton name="pencil" onPress={() => navio.push('ItineraryForm', {itineraryId})}/>}
                    </View>
                    <Image source={CHIBI_EMPTY} style={{ height: 160, aspectRatio: 1, alignSelf: "center" }} />
                    <View style={{ padding: 32 }}>
                      <Text style={{fontWeight: 'bold', textAlign: 'center'}}>Oops! No Activities Yet!</Text>
                      <Text style={{textAlign: 'center'}}>
                        Start planning your adventure by going to edit mode and pressing the + button!
                      </Text>
                    </View>
                  </View>
                )
              }
            </SlidingUpPanel>
          </View>
        </View>
      )}

      {!loading && (
        <View style={{ flex: 1 }}>
          {editMode ? (
            <FloatingActionMenu 
              icon='add'
              onPress1={addDummyActivity}
              onPress2={() => navio.push('ActivityForm', {itineraryId: itineraryId})}
            />
          ) : (
            <FloatingActionButton
              icon={tracked ? 'stop-circle' : 'location'}
              onPress={toggleTrack}
            />
          )}
        </View>
      )}
          
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  header: {
    minHeight: '60%',
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  headerButton: {
    backgroundColor: 'white',
    opacity: 0.8,
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8ff',
    borderRadius: 16,
  },
  dragHandleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
  },
});

Itinerary.options = {
  headerShown: false,
}