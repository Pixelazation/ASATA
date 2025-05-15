import React, { useState } from 'react';
import {View, Text} from 'react-native-ui-lib';
import { LineProgressNode } from './atoms/line-progress-node';
import { Icon } from './icon';
import { Image, Pressable, StyleSheet } from 'react-native';
import { BG_IMAGE } from '../assets';
import { IconButton } from './iconbutton';
import { ItineraryApi } from '../services/api/itineraries';
import { timestampToDateTimeString } from '../utils/dateutils';
import { ActivityModal } from './molecules/activity-modal';

type Props = {
  activity: ActivityType;
  editMode?: boolean;
  handleDelete: (id: string) => void;
};

export const Activity: React.FC<Props> = ({activity, editMode = false, handleDelete}) => {
  const {id, start_time, end_time, cost, category, description, name, image_url} = activity;
  const startTime = timestampToDateTimeString(start_time);

  const finished = new Date(start_time) < new Date();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <LineProgressNode finished={finished} />
      <View style={{flex: 1, gap: 8}}>
        <Text style={styles.time}>
          {startTime}
        </Text>
        <ActivityModal visible={modalVisible} activityDetails={activity} closeModal={() => setModalVisible(false)} />
        <Pressable style={styles.details} onPress={() => setModalVisible(true)}>
          <View style={styles.body}>
            <View style={styles.title}>
              <Icon name='cafe' size={24} color='black' />
              <Text style={styles.titleText}>{name}</Text>
            </View>
            <View style={styles.description}>
              <Text style={styles.descText}>
                {description}
              </Text>
              <Image source={image_url ? {uri: image_url} : BG_IMAGE} resizeMode='cover' style={styles.descImg} />
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.descText}>
              $$$
            </Text>
            {editMode && (
              <View style={styles.footerButtons}>
                <IconButton name='pencil' onPress={() => {}}/>
                <IconButton name='trash' color='red' onPress={() => handleDelete(id!)}/>
              </View>
            )}
          </View>
        </Pressable>
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
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,

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
    width: 80,
    height: 80,
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
