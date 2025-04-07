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

export type Params = {
  type?: 'push' | 'show';
  itineraryId?: string;
};

export const Itinerary: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const {t, navio} = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  const { itineraryId } = params;

  const [panelRef, setPanelRef] = useState<SlidingUpPanel | null>();
  const [editMode, setEditMode] = useState(false);

  // const {ui} = useStores();

  // State

  // Methods

  // Start
  useEffect(() => {
    configureUI();
  }, []);

  // UI Methods
  const configureUI = () => {
    navigation.setOptions({});
  };

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
                <Text section>Itinerary Name</Text>
              </View>
              <ScrollView contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
                <View style={{flexDirection: 'row', gap: 8}}>
                  <LineProgressHead />
                  <View style={{marginBottom: 16}}>
                    <Text section>In **Location**</Text>
                  </View>
                </View>

                <Activity />
                <Activity />
                <Activity />
                <Activity />
                <Activity />
              </ScrollView>
            </View>
          </SlidingUpPanel>
        </View>
      </ImageBackground>
      
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