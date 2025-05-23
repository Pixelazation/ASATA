import React, {useEffect, useState} from 'react';
import {Alert, Image, ImageBackground, ScrollView, StyleSheet} from 'react-native';
import {View, Text, Assets, Button, DateTimePicker, ProgressBar} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';

import {useStores} from '@app/stores';
import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import { colors } from '../../utils/designSystem';
import { FormField } from '../../components/form-field';
import { PickerFixed } from '../../components/picker-fixed';
import { BG_IMAGE, LOGO_IMAGE } from '../../assets';

export type Props = {
  type?: 'push';
};

export const AuthSignup: NavioScreen<Props> = observer(({type = 'push'}) => {
  useAppearance(); // for Dark Mode
  const {t, navio, api} = useServices();
  const {auth} = useStores();

  // State
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>();

  const [step, setStep] = useState(1);

  // Start
  useEffect(() => {
    configureUI();
  }, []);

  // API Methods
  async function signUpWithEmail() {
    setLoading(true);
    const { data: { user, session }, error } = await api.auth.signUp(email, password);
  
    if (error) {
      Alert.alert(error.message);
    } else {
      if (user) {
        // Insert additional user details into the database
        const { error: insertError } = await api.auth.insertUserDetails({
          user_id: user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          mobile_number: phoneNumber,
          gender,
          birthdate: dateOfBirth?.toISOString() || '',
        });
  
        if (insertError) {
          Alert.alert(insertError.message);
        } else {
          auth.set('email', email);
          // marking that we are logged in
          auth.set('state', 'logged-in');
  
          // navigating to main app
          navio.setRoot('tabs', 'AppTabs');
        }
      }
    }
  
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  // Methods
  const configureUI = () => {};

  const handleStep1 = () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    else if (password.length < 6) {
      Alert.alert('Password must be at least 6 characters long');
      return;
    }
    else if (!email.includes('@')) {
      Alert.alert('Please enter a valid email address');
      return;
    }
    else if (email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Please fill in all fields');
      return;
    }
    setStep(2);
  }

  const StepOne = (
    <View style={{gap: 16, paddingVertical: 16}}>
      <FormField 
          label='Email'
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          inputMode='email'
        />

        <FormField 
          label='Password'
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          keyboardType='default'
          secureTextEntry
        />

        <FormField 
          label='Confirm Password'
          placeholder='Confirm Password'
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          keyboardType='default'
          secureTextEntry
        />

        <Button
          br30 bg-accent white
          size='large'
          label={'Next'}
          labelStyle={{paddingHorizontal: 64}}
          style={{marginVertical: 16}}
          onPress={handleStep1}
          disabled={password == '' || email == '' || confirmPassword == ''} 
        />
    </View>
  );

  const StepTwo = (
    <View style={{gap: 4}}>
      <FormField 
        label='First Name'
        placeholder='First Name'
        value={firstName}
        onChangeText={setFirstName}
        keyboardType='default'
      />
      <FormField
        label='Last Name'
        placeholder='Last Name'
        value={lastName}
        onChangeText={setLastName}
        keyboardType='default'
      />

      <DateTimePicker 
        accent
        style={{paddingHorizontal: 16, paddingVertical: 8}}
        fieldStyle={{backgroundColor: '#ECF2F0', borderRadius: 100, paddingVertical: 4, marginTop: 4}}
        label='Date of Birth'
        labelColor={colors.primary}
        labelStyle={{fontWeight: 'bold'}}
        placeholder='DD/MM/YYYY'
        placeholderTextColor={'grey'}
        value={dateOfBirth}
        onChange={setDateOfBirth}
        mode='date'
        maximumDate={new Date()}
      />
      <PickerFixed 
        label='Gender'
        value={gender}
        placeholder='Gender'
        onValueChange={setGender}
        items={['Male', 'Female', 'Other', 'Prefer not to say']}
      />

      <FormField
        label='Phone Number'
        placeholder='Phone Number'
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType='phone-pad'
      />

      <Button
        br30 bg-accent white
        size='large'
        label={'Sign Up'}
        labelStyle={{paddingHorizontal: 64}}
        style={{marginVertical: 16}}
        onPress={signUpWithEmail}
        disabled={
          firstName == ''
          || lastName == ''
          || phoneNumber == ''
          || dateOfBirth == undefined
        }
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{flex: 1, justifyContent: 'center', minHeight: 750}}>
      <ImageBackground source={BG_IMAGE} style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: -30, paddingBottom: 30, position: 'relative'}}>
          <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)',}}/>
          <Image source={LOGO_IMAGE} style={{width: 240, height: 200}} resizeMode='center'/>
          
      </ImageBackground>

      <View flex bg-white center style={{marginTop: -30, flexGrow: 3, borderTopLeftRadius: 80, justifyContent: 'space-evenly'}}>
        <View center style={{gap: 10}}>
          <Text style={{fontSize: 28,fontWeight: 'bold', color: colors.primary}}>Register</Text>
          <Text style={{color: 'grey', fontWeight: 500}}>Create new account</Text>
        </View>

        <View center style={{gap: 10}}>
          <Text primary style={{fontSize: 12, fontWeight: 'bold'}}>Please fill out the following information to register</Text>
          
        </View>

        {step === 1 && StepOne}
        {step === 2 && StepTwo}

        <Text accent style={{fontWeight: 500}}>
          Already have an account? <Text primary onPress={() => navio.push('AuthLogin')}>Login here</Text>
        </Text>

      </View>
    </ScrollView>
  );
});

AuthSignup.options = props => ({
  title: `Auth flow`,
  headerShown: false
});
