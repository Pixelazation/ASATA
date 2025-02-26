import React, {useEffect} from 'react';
import {ScrollView} from 'react-native';
import {Text, View} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';

import {services, useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import {NavioSection} from '@app/components/sections/NavioSection';
import { SplashBanner } from '../components/splash-banner';
import { ItineraryTracker } from '../components/itinerary-tracker';

export type Params = {
  type?: 'push' | 'show';
  productId?: string;
};

export const Main: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const {t, navio} = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();
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
    <View flex bg-white>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <SplashBanner />

        <ItineraryTracker />
      </ScrollView>
    </View>
  );
});

Main.options = props => ({
  title: ``,
});
