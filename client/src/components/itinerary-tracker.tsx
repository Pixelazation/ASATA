import React from 'react';
import {View, Text} from 'react-native-ui-lib';
import {Icon} from '@app/components/icon'; // Assuming Icon is imported from your project

type Props = {
  title?: string;
};

export const ItineraryTracker: React.FC<Props> = ({title}) => {
  return (
    <View marginV-s2>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text section textColor>
          Tracked Itinerary
        </Text>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="arrow-forward" size={16} color="black" />
        </View>
      </View>
      <View
        style={{
          marginTop: 10,
          padding: 20,
          backgroundColor: '#f0f0f0', // Light gray background
          borderRadius: 10, // Rounded corners
          alignItems: 'center', // Center text horizontally
          justifyContent: 'center', // Center text vertically
        }}
      >
        <Text textColor center>
          You are currently not tracking an itinerary
        </Text>
      </View>
    </View>
  );
};
