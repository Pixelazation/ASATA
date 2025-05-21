import React from 'react';
import { Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { View, Text, Button } from 'react-native-ui-lib';

type Itinerary = {
  id: string;
  name: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  itineraries: Itinerary[];
  onSelect: (itineraryId: string) => void;
};

const AddToItineraryModal: React.FC<Props> = ({
  visible,
  onClose,
  itineraries,
  onSelect,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text text60 marginB-s2>Add to Itinerary</Text>

          {itineraries.length === 0 ? (
            <Text text70 center>
              You don't have any itineraries yet. Please create one first.
            </Text>
          ) : (
            itineraries.map(itinerary => (
              <TouchableOpacity
                key={itinerary.id}
                style={styles.itemButton}
                onPress={() => onSelect(itinerary.id)}
              >
                <Text text70>{itinerary.name}</Text>
              </TouchableOpacity>
            ))
          )}

          <Button label="Close" onPress={onClose} marginT-s4 />
        </View>
      </View>
    </Modal>
  );
};

export default AddToItineraryModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  itemButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
