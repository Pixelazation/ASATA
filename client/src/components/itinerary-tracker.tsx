import React from 'react';
import {View, Text} from 'react-native-ui-lib';

type Props = {
  title?: string;
};

export const ItineraryTracker: React.FC<Props> = ({title}) => {
  return (
    <View margin-s2 marginV-s2 paddingH-s3>
      <Text section textColor>
        Tracked Itinerary
      </Text>
      <Text textColor center>
        You are currently not tracking an itinerary
      </Text>
    </View>
  );
};
