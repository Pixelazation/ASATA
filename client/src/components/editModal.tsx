import React from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';
import { DateTimePicker } from 'react-native-ui-lib';
import { PickerFixed } from '@app/components/picker-fixed';

interface EditModalProps {
  modalVisible: boolean;
  currentField: string;
  currentValue: string;
  setCurrentValue: (value: string) => void;
  handleModalSave: () => void;
  setModalVisible: (visible: boolean) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ modalVisible, currentField, currentValue, setCurrentValue, handleModalSave, setModalVisible }) => {
  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit {currentField}</Text>
          {currentField === 'Birth Date' ? (
            <DateTimePicker
              accent
              fieldStyle={{ backgroundColor: 'white', borderWidth: 2, borderColor: 'grey', borderRadius: 6, padding: 4 }}
              label='Date of Birth'
              labelStyle={{ fontWeight: 'bold' }}
              placeholder='DD/MM/YYYY'
              placeholderTextColor={'grey'}
              value={new Date(currentValue)}
              onChange={(date: { toISOString: () => string; }) => setCurrentValue(date.toISOString().split('T')[0])}
              mode="date"
              maximumDate={new Date()}
            />
          ) : currentField === 'Gender' ? (
            <PickerFixed
                value={currentValue}
                placeholder='Gender'
                onValueChange={setCurrentValue}
                items={['Male', 'Female', 'Other', 'Prefer not to say']} label={''}            />
          ) : (
            <TextInput
              style={styles.input}
              value={currentValue}
              onChangeText={setCurrentValue}
              placeholder={`Enter your ${currentField}`}
              keyboardType={currentField === 'Phone Number' ? 'phone-pad' : 'default'}
            />
          )}
          <View style={styles.modalButtonContainer}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <Button title="Save" onPress={handleModalSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  input: {
    height: 40,
    width: 180,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});