import React from 'react';
import {View, Text, Modal} from 'react-native-ui-lib';
import { Icon } from '../icon';
import { ImageBackground, Pressable, StyleSheet, Touchable, TouchableWithoutFeedback } from 'react-native';
import { BG_IMAGE } from '../../assets';
import { colors } from '../../utils/designSystem';

type Props = {
  visible: boolean;
  closeModal: () => void;
};

export const ActivityModal: React.FC<Props> = ({visible, closeModal}) => {
  return (
    <Modal
      transparent={true}
      animationType='fade'
      overlayBackgroundColor="rgba(151, 151, 151, 0.45)"
      visible={visible}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
      <View style={styles.centeredContainer}>
      <Pressable style={styles.details}>
        <View style={styles.body}>
          <ImageBackground source={BG_IMAGE} resizeMode='cover' style={styles.descImg}>
            <View style={{ flexGrow: 1 }}>
              <View style={styles.calendar}>
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 14 }}>
                  MM
                </Text>
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 20}}>
                  DD
                </Text>
              </View>
            </View>
            
            <View style={styles.description}>
              <Text style={{ color: 'white', fontSize: 12 }}>
                Description goes here test
              </Text>
            </View>
          </ImageBackground>
          <Text style={{ color: colors.primary }}>
            DAY 00:00 PM
          </Text>
          <Text style={styles.placeName}>
            Place Name
          </Text>
          <Text style={styles.address}>
            Address: Lorem ipsum
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.title}>
            <Icon name='cafe' size={24} color='black' />
            <Text style={styles.titleText}>Name Here</Text>
          </View>
          <View>
            <Text style={styles.descText}>
              $$$
            </Text>
          </View>   
        </View>
      </Pressable>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenTouchable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    width: '80%',
  },
  body: {
    padding: 16,
    gap: 2,
  },
  title: {
    flexDirection: 'row',
    gap: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendar: {
    backgroundColor: colors.primary,
    width: '25%',
    aspectRatio: 1.1,
    margin: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    alignContent: 'center',
    justifyContent: 'center',
  },
  description: {
    width: '100%',
    minHeight: 60,
    padding: 8,
    flexDirection: 'row',
    backgroundColor: 'rgba(120, 120, 120, 0.65)',
  },
  descText: {
    flex: 1,
    flexGrow: 1,
    fontSize: 12,
    fontWeight: '100',
    color: 'gray',
  },
  descImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  placeName: {
    fontSize: 24,
    fontWeight: '900',
  },
  address: {
    fontSize: 12,
    fontWeight: '100',
    color: 'gray',
  },
  footer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'black',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignContent: 'center',
    minHeight: 44,
  },
});
