import 'react-native-url-polyfill/auto';
import 'expo-dev-client';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {LogBox} from 'react-native';

import * as Linking from 'expo-linking';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {NavioApp} from '@app/navio';
import {
  configureDesignSystem,
  getNavigationTheme,
  getStatusBarBGColor,
  getStatusBarStyle,
} from '@app/utils/designSystem';
import {hydrateStores, useStores} from '@app/stores';
import {initServices} from '@app/services';
import {AppProvider} from '@app/utils/providers';
import {useAppearance} from '@app/utils/hooks';
import { supabase } from '@app/lib/supabase';
import * as Notifications from 'expo-notifications';
import { NotificationsApi } from './src/services/api/notifications';

LogBox.ignoreLogs([
  'Require',
  'Found screens with the same name nested inside one another.', // for navio in some cases
  "The new TextField implementation does not support the 'expandable' prop",
]);

export default (): JSX.Element => {
  useAppearance();
  const { auth } = useStores();

  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  // `onLaunch` performs actions that have to be done on app launch before displaying app UI.
  // If you need to make some api requests, load remote config, or some other "heavy" actions, you can use `@app/services/onLaunch.tsx`.
  const checkSession = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);

    if (user) await auth.login();
  }, []);

  const onLaunch = useCallback(async () => {
    await SplashScreen.preventAutoHideAsync();

    await hydrateStores();
    configureDesignSystem();
    await initServices();

    await checkSession();

    setReady(true);
    await SplashScreen.hideAsync();
  }, [checkSession]);

  useEffect(() => {
    onLaunch();
  }, [onLaunch]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    NotificationsApi.registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  useEffect(() => {
    NotificationsApi.updatePushToken(expoPushToken);
  }, [isLoggedIn, expoPushToken])

  const NotReady = useMemo(() => {
    // [Tip]
    // You can show loading state here.
    return <></>;
  }, [ready]);

  if (!ready) return NotReady;
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppProvider>
        <StatusBar style={getStatusBarStyle()} backgroundColor={getStatusBarBGColor()} />
        <NavioApp
          navigationContainerProps={{
            theme: getNavigationTheme(),
            linking: {
              prefixes: [Linking.createURL('/')],
            },
          }}

          // [Tip]
          // You can use `root` to change the root of the app depending on global state changes.
          // root={isLoggedIn ? 'AuthStack' : 'AppTabs'}
          root={isLoggedIn ? 'tabs.AppTabs' : 'stacks.AuthFlow'}
        />
      </AppProvider>
    </GestureHandlerRootView>
  );
};
