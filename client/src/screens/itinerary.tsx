import React, {useEffect, useState} from 'react';
import {Button, ImageBackground, ScrollView, StyleSheet} from 'react-native';
import {Gradient, Text, View} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';
import SlidingUpPanel from 'rn-sliding-up-panel';

import {services, useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import {NavioSection} from '@app/components/sections/NavioSection';
import { BG_IMAGE } from '../assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity } from '../components/activity';
import { LineProgressHead } from '../components/atoms/line-progress-head';
import { IconButton } from '../components/iconbutton';
import { FloatingActionButton } from '../components/atoms/floating-action-button';
import { ItineraryApi } from '../services/api/itineraries';

export type Params = {
  type?: 'push' | 'show';
  itineraryId: string;
  name: string
  location?: string;
};

export const Itinerary: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const {t, navio} = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  const { itineraryId, name, location } = params;

  // State
  const [panelRef, setPanelRef] = useState<SlidingUpPanel | null>();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activities, setActivities] = useState<ActivityType[]>([]);

  // Methods
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

  // Start
  useEffect(() => {
    configureUI();
    fetchActivities(); // Fetch data on mount
  }, []);

  // UI Methods
  const configureUI = () => {
    navigation.setOptions({});
  };

  const activityList = activities.map((activity, index) => (
    <Activity key={index} activity={activity} editMode={editMode} handleDelete={deleteActivity} />
  ))

  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
      <ImageBackground source={BG_IMAGE} resizeMode='cover'>
        <View style={styles.header}>
          <View style={styles.headerButton}>
            <IconButton
              name='arrow-back'
              onPress={() => navigation.goBack()}
            />
          </View>
          <View style={styles.headerButton}>
            <IconButton
              name={editMode ? 'eye' : 'pencil'}
              onPress={() => setEditMode(!editMode)}
            />
          </View>
        </View>
        <View style={{flex: 1}}>
          <SlidingUpPanel containerStyle={styles.container} ref={c => setPanelRef(c)} draggableRange={{top: 350, bottom: 50}} snappingPoints={[50, 350]} friction={0.5}>
            <View style={{flex: 1, padding: 16}}>
              <View style={{paddingBottom: 16}}>
                <Text section>{name}</Text>
              </View>
              <ScrollView contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
                

                {loading ? (
                  <Text text70M>Loading activities...</Text>
                ) : activities.length > 0 ? (
                  <View>
                    <View style={{flexDirection: 'row', gap: 8}}>
                      <LineProgressHead />
                      <View style={{marginBottom: 16}}>
                        <Text section>In {location}</Text>
                      </View>
                    </View>
                    <View style={{paddingBottom: 64}}>
                      {activityList}
                    </View>
                  </View>
                ) : (
                  <Text text70M>No activities found.</Text>
                )}
              </ScrollView>
            </View>
          </SlidingUpPanel>
        </View>
      </ImageBackground>

      <FloatingActionButton
        icon={editMode ? 'add' : 'location'}
        onPress={() => {
          if (editMode) {
            addDummyActivity();
          } else {
            panelRef?.hide();
          }
        }}
      />
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
});

Itinerary.options = {
  headerShown: false,
}