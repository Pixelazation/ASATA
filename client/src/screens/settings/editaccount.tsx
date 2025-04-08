import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Modal} from 'react-native';
import {DateTimePicker} from 'react-native-ui-lib';
import {NavioScreen} from 'rn-navio';
import {supabase} from '@app/lib/supabase';
import {Icon} from '@app/components/icon';
import {PickerFixed} from '@app/components/picker-fixed';

export const EditAccount: NavioScreen = () => {
  const [email, setEmail] = useState('');
  const [password] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserData();
        setEmail(data.email);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setDateOfBirth(data.birthdate);
        setGender(data.gender);
        setPhoneNumber(data.mobile_number);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('An unknown error occurred:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (field: React.SetStateAction<string>, value: React.SetStateAction<string>) => {
    console.log('Opening modal for field:', field, 'with value:', value);
    setCurrentField(field);
    setCurrentValue(value);
    setModalVisible(true);
  };

  const handleModalSave = async () => {
    console.log('Saving modal data for field:', currentField, 'with value:', currentValue);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Error fetching user:', authError);
      return;
    }

    if (currentField === 'Password') {
      if (currentValue !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        setErrorModalVisible(true);
        return;
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: currentValue,
      });
      if (passwordError) {
        console.error('Error updating password in authentication table:', passwordError);
        return;
      }
      console.log('Password updated successfully in authentication table');
      setSuccessMessage('Your password has been updated successfully.');
      setSuccessModalVisible(true);
    }

    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => openModal('Email', email)} style={styles.row}>
        <Text style={styles.label}>Email: {email}</Text>
        <Icon name="chevron-forward" />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity onPress={() => openModal('Password', password)} style={styles.row}>
        <Text style={styles.label}>Password {password}</Text>
        <Icon name="chevron-forward" />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity onPress={() => openModal('First Name', firstName)} style={styles.row}>
        <Text style={styles.label}>First Name: {firstName}</Text>
        <Icon name="chevron-forward" />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity onPress={() => openModal('Last Name', lastName)} style={styles.row}>
        <Text style={styles.label}>Last Name: {lastName}</Text>
        <Icon name="chevron-forward" />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity onPress={() => openModal('Birth Date', dateOfBirth)} style={styles.row}>
        <Text style={styles.label}>Date of Birth: {dateOfBirth}</Text>
        <Icon name="chevron-forward" />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity onPress={() => openModal('Gender', gender)} style={styles.row}>
        <Text style={styles.label}>Gender: {gender}</Text>
        <Icon name="chevron-forward" />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity onPress={() => openModal('Phone Number', phoneNumber)} style={styles.row}>
        <Text style={styles.label}>Phone Number: {phoneNumber}</Text>
        <Icon name="chevron-forward" />
      </TouchableOpacity>
      <View style={styles.divider} />

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {currentField}</Text>
            {currentField === 'Password' ? (
              <>
                <TextInput
                  style={styles.input}
                  value={currentValue}
                  onChangeText={setCurrentValue}
                  placeholder="Enter new password"
                  secureTextEntry={true}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={true}
                />
              </>
            ) : currentField === 'Birth Date' ? (
              <DateTimePicker
                accent
                fieldStyle={{backgroundColor: 'white', borderWidth: 2, borderColor: 'grey', borderRadius: 6, padding: 4}}
                label='Date of Birth'
                labelStyle={{fontWeight: 'bold'}}
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
                  items={['Male', 'Female', 'Other', 'Prefer not to say']} label={''}/>
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
      <Modal
        transparent={true}
        visible={errorModalVisible}
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <Button title="Close" onPress={() => setErrorModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={successModalVisible}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            <Button title="Close" onPress={() => setSuccessModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

EditAccount.options = {
  title: 'Edit Account',
};

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8,
  },
  input: {
    height: 40,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
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
  errorMessage: {
    color: 'red',
    marginBottom: 10,
  },
  successMessage: {
    color: 'green',
    marginBottom: 10,
  },
});