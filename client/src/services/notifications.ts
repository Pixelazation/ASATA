import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Alert } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

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