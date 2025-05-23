import React, {useEffect, useState} from 'react';
import {Alert, Image, ImageBackground, ScrollView, StyleSheet} from 'react-native';
import {View, Text, Assets, TextField, Button} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';

import {useStores} from '@app/stores';
import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import { colors } from '../../utils/designSystem';
import { FormField } from '../../components/form-field';
import { BG_IMAGE, LOGO_IMAGE } from '../../assets';

export type Props = {
  type?: 'push';
};

export const AuthLogin: NavioScreen<Props> = observer(({type = 'push'}) => {
  useAppearance(); // for Dark Mode
  const {navio, api} = useServices();
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
  async function signInWithEmail() {
    setLoading(true)

    const { error } = await api.auth.signIn(email, password);

    if (error) {
      Alert.alert(error.message)
    } else {
      auth.login()

      // navigating to main app
      navio.setRoot('tabs', 'AppTabs');
    }

    setLoading(false)
  }

  // Methods
  const configureUI = () => {};

  return (
    <ScrollView contentContainerStyle={{flex: 1, justifyContent: 'center', minHeight: 750}}>
      <ImageBackground source={BG_IMAGE} style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: -30, paddingBottom: 30, position: 'relative'}} resizeMode='cover'>
          <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)',}}/>
          <Image source={LOGO_IMAGE} style={{width: 240, height: 200}} resizeMode='center'/>
          
      </ImageBackground>

      <View flex bg-white center style={{marginTop: -30, flexGrow: 3, borderTopLeftRadius: 80, justifyContent: 'space-evenly'}}>
        <View center style={{gap: 10}}>
          <Text style={{fontSize: 28,fontWeight: 'bold', color: colors.primary}}>Welcome Back</Text>
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
            disabled={email === '' || password === ''}
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
