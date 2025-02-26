import React, {useEffect} from 'react';
import {ScrollView} from 'react-native';
import {Text, View} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';

import {services, useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import {ItineraryItem} from '../components/itineraryitem';

export type Params = {
  itineraryId?: string;
};

export const MyItineraries: NavioScreen = observer(() => {
  useAppearance(); // Enables dark mode handling
  const {t, navio} = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  useEffect(() => {
    configureUI();
  }, []);

  const configureUI = () => {
    navigation.setOptions({});
  };

  // Dummy itineraries for now
  const itineraries = [
    { id: '1', name: 'Trip to Cebu', location: 'Cebu, Philippines', startDate: '2024-06-01', endDate: '2024-06-05' },
    { id: '2', name: 'Baguio Adventure', location: 'Baguio, Philippines', startDate: '2024-07-10', endDate: '2024-07-15' },
    { id: '3', name: 'Baguio Adventure', location: 'Baguio, Philippines', startDate: '2024-07-10', endDate: '2024-07-15' },
    { id: '4', name: 'Baguio Adventure', location: 'Baguio, Philippines', startDate: '2024-07-10', endDate: '2024-07-15' },
    { id: '5', name: 'Baguio Adventure', location: 'Baguio, Philippines', startDate: '2024-07-10', endDate: '2024-07-15' },
    { id: '6', name: 'Baguio Adventure', location: 'Baguio, Philippines', startDate: '2024-07-10', endDate: '2024-07-15' },
    { id: '7', name: 'Baguio Adventure', location: 'Baguio, Philippines', startDate: '2024-07-10', endDate: '2024-07-15' },
    { id: '8', name: 'Baguio Adventure', location: 'Baguio, Philippines', startDate: '2024-07-10', endDate: '2024-07-15' },
  ];

  return (
    <View flex bg-bgColor padding-s3>
      <ScrollView contentInsetAdjustmentBehavior="always">
        {/* Render Itinerary List */}
        {itineraries.map(itinerary => (
          <ItineraryItem key={itinerary.id} {...itinerary} />
        ))}
      </ScrollView>
    </View>
  );
});

MyItineraries.options = {
  headerBackTitleStyle: false,
  title: 'My Itineraries',
};
