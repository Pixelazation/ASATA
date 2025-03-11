import React, {useEffect, useState} from 'react';
import {Alert, ScrollView} from 'react-native';
import {View, Text, Image, Assets, Button, DateTimePicker} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';

import {useStores} from '@app/stores';
import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import { colors } from '../../utils/designSystem';
import { FormField } from '../../components/form-field';
import { PickerFixed } from '../../components/picker-fixed';

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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>();

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

  // Assets
  Assets.loadAssetsGroup('images', {
    logo: require('../../assets/asata_logo.png')
  });

  const Divider = () => <View style={{ width: '100%', height: 1, backgroundColor: 'grey', marginVertical: 10 }} />;

  return (
    <View flex bg-white center>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <View flex centerV marginT-s10>

          <View flex centerH marginT-s10>
            <Image width={250} height={120} assetName='logo' assetGroup='images'/>  
          </View>

          <View marginT-s6 centerH>
            <Text text50 primary>SIGNUP</Text>

            <View
              bg-white
              br30
              paddingH-s4
              paddingV-s2
              marginT-s6
              marginB-s10
              style={{width: 300, borderWidth: 1, borderColor: colors.primary, borderRadius: 12}}
            >
              
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

              <View>
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
              </View>

              <View>
                <DateTimePicker 
                  accent
                  fieldStyle={{backgroundColor: 'white', borderWidth: 2, borderColor: 'grey', borderRadius: 6, padding: 4}}
                  label='Date of Birth'
                  labelColor={colors.accent}
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
              </View>

              <FormField
                label='Phone Number'
                placeholder='Phone Number'
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType='phone-pad'
              />

              <View centerH>
                <Button
                  br30 bg-accent white marginT-s4
                  style={{width: '80%'}}
                  label={loading ? 'Logging in ...' : 'SIGN UP'}
                  onPress={signUpWithEmail}
                />
              </View>

            </View>

            <Divider />
            <Text accent style={{fontWeight: 500}}>
              Already have an account? <Text primary onPress={() => navio.push('AuthLogin')}>Login here</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

AuthSignup.options = props => ({
  title: `Auth flow`,
  headerShown: false
});
