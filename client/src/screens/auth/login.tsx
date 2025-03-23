import React, {useEffect, useState} from 'react';
import {Alert, Image, ImageBackground, ScrollView} from 'react-native';
import {View, Text, Assets, TextField, Button} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';

import {useStores} from '@app/stores';
import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import { colors } from '../../utils/designSystem';
import { FormField } from '../../components/form-field';

export type Props = {
  type?: 'push';
};

export const AuthLogin: NavioScreen<Props> = observer(({type = 'push'}) => {
  useAppearance(); // for Dark Mode
  const {t, navio, api} = useServices();
  const {auth} = useStores();

  // State
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const bg_image = require('../../assets/splash-bg-img.png');
  const logo_image = require('../../assets/asata_logo.png');

  // Start
  useEffect(() => {
    configureUI();
  }, []);

  // API Methods
  async function signInWithEmail() {
    setLoading(true)

    const { error } = await api.auth.signIn(email, password);

    if (error) {
      Alert.alert(error.message)
    } else {
      auth.set('email', email)
      // marking that we are logged in
      auth.set('state', 'logged-in');

      // navigating to main app
      navio.setRoot('tabs', 'AppTabs');
    }

    setLoading(false)
  }

  // Methods
  const configureUI = () => {};

  // Assets
  Assets.loadAssetsGroup('images', {
    logo: require('../../assets/asata_logo.png')
  });

  const Divider = () => <View style={{ width: '100%', height: 0.5, backgroundColor: 'grey', marginVertical: 10 }} />;

  return (
    <ScrollView contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
      <ImageBackground source={bg_image} style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: -30, paddingBottom: 30}}>
        
          <Image source={logo_image} style={{width: 177, height: 150}} resizeMode='center'/>
          
      </ImageBackground>

      <View flex bg-white center style={{marginTop: -30, flexGrow: 3, borderTopLeftRadius: 80, justifyContent: 'space-evenly'}}>
        <View center style={{gap: 10}}>
          <Text primary text40 style={{fontWeight: 'bold'}}>Welcome Back</Text>
          <Text style={{color: 'grey', fontWeight: 500}}>Login to your account</Text>
        </View>

        <View
          bg-white
          br30
          paddingH-s4
          marginB-s10
          style={{width: 300, gap: 16}}
        >
          <FormField 
            label='Email Address'
            placeholder='Email Address'
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

        </View>

        <View centerH>
          <Button
            br30 bg-accent white
            size='large'
            label={loading ? 'Logging in ...' : 'Login'}
            labelStyle={{paddingHorizontal: 64}}
            onPress={signInWithEmail}
          />
        </View>

        <Text accent style={{fontWeight: 500}}>
          Don't have an account? <Text primary onPress={() => navio.push('AuthSignup')}>Register now</Text>
        </Text>

      </View>
      
    </ScrollView>
  );
});

AuthLogin.options = props => ({
  title: `Auth flow`,
  headerShown: false
});
