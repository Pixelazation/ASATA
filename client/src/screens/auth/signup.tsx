import React, {useEffect, useState} from 'react';
import {Alert, ScrollView} from 'react-native';
import {View, Text, Image, Assets, TextField, Button} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';

import {useStores} from '@app/stores';
import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import { colors } from '../../utils/designSystem';

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

  // Start
  useEffect(() => {
    configureUI();
  }, []);

  // API Methods
  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await api.auth.signUp(email, password);

    if (error) {
      Alert.alert(error.message)
    } else {
      auth.set('email', email)
      // marking that we are logged in
      auth.set('state', 'logged-in');

      // navigating to main app
      navio.setRoot('tabs', 'AppTabs');
    }

    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  // Methods
  const configureUI = () => {};

  // Assets
  Assets.loadAssetsGroup('images', {
    logo: require('../../assets/asata_logo.png')
  });

  // TODO: Move to separate file
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
              <View paddingH-s3 paddingV-s2>
                <TextField
                  accent
                  fieldStyle={{backgroundColor: 'white', borderWidth: 2, borderColor: 'grey', borderRadius: 6, padding: 4}}
                  label='Username'
                  labelColor={colors.accent}
                  labelStyle={{fontWeight: 'bold'}}
                  placeholder={'Email'}
                  placeholderTextColor={'grey'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  inputMode="email"
                />
              </View>

              <View paddingH-s3 paddingV-s2>
                <TextField
                  accent
                  fieldStyle={{backgroundColor: 'white', borderWidth: 2, borderColor: 'grey', borderRadius: 6, padding: 4}}
                  label='Password'
                  labelColor={colors.accent}
                  labelStyle={{fontWeight: 'bold'}}
                  placeholder={'Password'}
                  placeholderTextColor={'grey'}
                  value={password}
                  onChangeText={setPassword}
                  keyboardType='default'
                  secureTextEntry={true}
                />
              </View>

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
