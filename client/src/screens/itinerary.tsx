import React, {useEffect, useState} from 'react';
import {Button, ImageBackground, ScrollView, StyleSheet} from 'react-native';
import {Text, View} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';
import SlidingUpPanel from 'rn-sliding-up-panel';

import {services, useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import {NavioSection} from '@app/components/sections/NavioSection';
import { BG_IMAGE } from '../assets';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  // UI Methods

  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
      <ImageBackground source={BG_IMAGE} resizeMode='cover'>
        <View style={{minHeight: '60%'}}>
          <Text>Test Header</Text>
          <Button title='Show' onPress={() => panelRef?.show()} />
        </View>
        <View style={{flex: 1}}>
          <SlidingUpPanel containerStyle={styles.container} ref={c => setPanelRef(c)} draggableRange={{top: 350, bottom: 50}} snappingPoints={[50, 350]} friction={0.5}>
            <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
              <Text section>Itinerary Name</Text>
              <Text>{itineraryId}</Text>
              <Button title='Hide' onPress={() => panelRef?.hide()} />
              
              <View>
                <Text section>In \(Location\)</Text>
              </View>
            </ScrollView>
          </SlidingUpPanel>
        </View>
      </ImageBackground>
      
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8ff',
    borderRadius: 16,
    padding: 16,
  },
});

Itinerary.options = {
  headerShown: false,
}