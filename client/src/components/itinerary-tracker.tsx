import React from 'react';
import {View, Text} from 'react-native-ui-lib';
import {Icon} from '@app/components/icon'; // Assuming Icon is imported from your project
import { Image, StyleSheet } from 'react-native';
import { BG_IMAGE } from '../assets';

type Props = {
  title?: string;
};

export const ItineraryTracker: React.FC<Props> = ({title}) => {

  const fetchTrackedItineraryDetails = () => {
    return;
  }

  return (
    <View style={{ display: 'flex', gap: 16 }}>

      {/* Header */}
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

      {/* Details */}
      <View style={{flex: 1, flexDirection: 'row', gap: 8}}>
        <View>
          <Image source={BG_IMAGE} resizeMode='cover' style={styles.descImg} />
        </View>
        <View style={styles.details}>
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <Icon name='cafe' size={24} color='black' />
            <Text>Activity Name</Text>
          </View>
          <Text>Start: </Text>
          <Text>End: </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8
  },
  time: {
    fontSize: 12,
    fontWeight: '300',
    color: 'gray',
  },
  details: {
    backgroundColor: 'white',
    padding: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    flex: 1,
    flexGrow: 1,
    gap: 8,

    // iOS Shadows
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 4 },

    // Android Shadow
    elevation: 4,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  title: {
    flexDirection: 'row',
    gap: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  descText: {
    flex: 1,
    flexGrow: 1,
    fontSize: 12,
    fontWeight: '100',
    color: 'gray',
  },
  descImg: {
    width: 100,
    height: 100,
    borderRadius: 16
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'black',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 8,
  }
});
