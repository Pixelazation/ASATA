import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Modal} from 'react-native';
import {DateTimePicker} from 'react-native-ui-lib';
import {NavioScreen} from 'rn-navio';
import {supabase} from '@app/lib/supabase';
import {Icon} from '@app/components/icon';
import {PickerFixed} from '@app/components/picker-fixed';

export const EditAccount: NavioScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('UserDetails')
        .select('email, first_name, last_name, birthdate, gender, mobile_number')
        .eq('user_id', user.id)  
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      } else if (!data) {
        console.error('No user data found');
      } else {
        setEmail(data.email);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setDateOfBirth(data.birthdate);
        setGender(data.gender);
        setPhoneNumber(data.mobile_number);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const openModal = (field: React.SetStateAction<string>, value: React.SetStateAction<string>) => {
    console.log('Opening modal for field:', field, 'with value:', value);
    setCurrentField(field);
    setCurrentValue(value);
    setModalVisible(true);
  };

  const handleModalSave = async () => {
    console.log('Saving modal data for field:', currentField, 'with value:', currentValue);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let updateData = {};
      switch (currentField) {
        case 'Email':
          setEmail(currentValue);
          updateData = { email: currentValue };
          // Update email in authentication table
          const { error: authError } = await supabase.auth.updateUser({
            email: currentValue,
          });
          if (authError) {
            console.error('Error updating email in authentication table:', authError);
            return;
          }
          break;
        case 'Password':
          setPassword(currentValue);
          // Assuming password is stored in a different table or handled differently
          break;
        case 'First Name':
          setFirstName(currentValue);
          updateData = { first_name: currentValue };
          break;
        case 'Last Name':
          setLastName(currentValue);
          updateData = { last_name: currentValue };
          break;
        case 'Birth Date':
          setDateOfBirth(currentValue);
          updateData = { birthdate: currentValue };
          break;
        case 'Gender':
          setGender(currentValue);
          updateData = { gender: currentValue };
          break;
        case 'Phone Number':
          setPhoneNumber(currentValue);
          updateData = { mobile_number: currentValue };
          break;
        default:
          break;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('UserDetails')
          .update(updateData)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating user data:', error);
        } else {
          console.log('Field updated successfully:', updateData);
        }
      }
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
            {currentField === 'Birth Date' ? (
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
                  items={['Male', 'Female', 'Other', 'Prefer not to say']} label={''}
              />
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
    </ScrollView>
  );
};

EditAccount.options = {
  title: 'Edit Account',
};

const styles = StyleSheet.create({
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
    width: 180,
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
});