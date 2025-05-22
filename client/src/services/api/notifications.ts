import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from 'expo-device';
import { Alert } from "react-native";
import Constants from 'expo-constants';
import { supabase } from '../../lib/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

export const NotificationsApi = {
  sendTestNotification: async (message: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notification",
          body: message,
        },
        trigger: null, // Trigger immediately
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  },

  requestNotificationPermissions: async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
            Alert.alert("Permission Denied", "Notification permissions are required to receive alerts.");
            return false;
        }
    }
    return true;
  },

  registerForPushNotificationsAsync: async () => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Project ID not found');
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  },

  updatePushToken: async (expoPushToken: string) => {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Update UserDetails with the push token
      await supabase
        .from('UserDetails')
        .update({ expo_push_token: expoPushToken })
        .eq('user_id', user.id);
    }
  }
}

export const sendTestNotification = async (message: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notification",
          body: message,
        },
        trigger: null, // Trigger immediately
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  
export const requestNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
            Alert.alert("Permission Denied", "Notification permissions are required to receive alerts.");
            return false;
        }
    }
    return true;
};

function handleRegistrationError(errorMessage: string) {
  Alert.alert(errorMessage);
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export const updatePushToken = async (expoPushToken: string) => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Update UserDetails with the push token
    await supabase
      .from('UserDetails')
      .update({ expo_push_token: expoPushToken })
      .eq('user_id', user.id);
  }
};