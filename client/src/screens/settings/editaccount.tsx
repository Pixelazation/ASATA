import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NavioScreen } from 'rn-navio';
import { supabase } from '@app/lib/supabase';
import { Icon } from '@app/components/icon';
import { EditModal } from '@app/components/editModal';
import { fetchUserData, updateUserData } from '@app/services/api/userdetails';
import { styles } from '@app/screens/settings/editAccountStyles';

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
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (field, value) => {
    setCurrentField(field);
    setCurrentValue(value);
    setModalVisible(true);
  };

  const handleModalSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let updateData = {};
      switch (currentField) {
        case 'Email':
          setEmail(currentValue);
          updateData = { email: currentValue };
          const { error: authError } = await supabase.auth.updateUser({ email: currentValue });
          if (authError) {
            console.error('Error updating email in authentication table:', authError);
            return;
          }
          break;
        case 'Password':
          setPassword(currentValue);
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
        try {
          await updateUserData(user.id, updateData);
          console.log('Field updated successfully:', updateData);
        } catch (error) {
          console.error(error.message);
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

      <EditModal
        modalVisible={modalVisible}
        currentField={currentField}
        currentValue={currentValue}
        setCurrentValue={setCurrentValue}
        handleModalSave={handleModalSave}
        setModalVisible={setModalVisible}
      />
    </ScrollView>
  );
};

EditAccount.options = {
  title: 'Edit Account',
};