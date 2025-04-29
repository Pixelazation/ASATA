import React, { useEffect } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text } from "react-native";
import { View, Button } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";
import { useServices } from "@app/services";
import { ItineraryTracker } from "../components/itinerary-tracker";
import { Carousel } from "../components/carousel";
import { BG_IMAGE } from "@app/assets";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@app/components/icon";
import { LocationTracker } from "@app/components/location-tracker";
import { WeatherTracker } from "@app/components/weather-tracker";
import { sendTestNotification, requestNotificationPermissions } from "@app/services/notifications";

export const Main: NavioScreen = observer(() => {
  const { navio } = useServices();
  const navigation = navio.useN();

  useEffect(() => {
    configureUI();
    requestNotificationPermissions(); // Ask for notification permissions
  }, []);

  const configureUI = () => {
    navigation.setOptions({});
  };

  const recommendationItems = [
    { title: "Recommendation 1", image: BG_IMAGE },
    { title: "Recommendation 2", image: BG_IMAGE },
    { title: "Recommendation 3", image: BG_IMAGE },
  ];

  const promotionItems = [
    { title: "Promotion 1", image: BG_IMAGE },
    { title: "Promotion 2", image: BG_IMAGE },
    { title: "Promotion 3", image: BG_IMAGE },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BG_IMAGE} style={styles.background}>
        <ScrollView contentInsetAdjustmentBehavior="always">
          <View style={styles.opaqueContainer}>
            <View style={styles.buttonRow}>
              <Button onPress={() => console.log("Accommodation")} style={styles.iconButton}>
                <Icon name="bed" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
              <Button onPress={() => console.log("Recreation")} style={styles.iconButton}>
                <Icon name="walk" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
              <Button onPress={() => console.log("Diner")} style={styles.iconButton}>
                <Icon name="pizza" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
            </View>
            <Button
              label="Get Suggestions"
              onPress={() => navio.push("GetSuggestions")}
              backgroundColor="#007AFF"
              color="white"
            />

            <ItineraryTracker />

            <Carousel title="Explore new places..." items={recommendationItems} />
            <Carousel title="Promotions" items={promotionItems} />
            <LocationTracker />
            <WeatherTracker />
            <View style={styles.buttonRow}>
              <Button
                onPress={() => sendTestNotification("You have an activity today!")}
                style={styles.actionButton}
              >
                <Icon name="time-outline" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
              <Button
                onPress={() => sendTestNotification("Oh my! It appears to be raining. Do you wish to change your activity?")}
                style={styles.actionButton}
              >
                <Icon name="rainy-outline" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
              <Button
                onPress={() => sendTestNotification("You have arrived at an activity area.")}
                style={styles.actionButton}
              >
                <Icon name="location-outline" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
});

Main.options = (props) => ({
  headerShown: false,
  title: `Main`,
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  background: {
    flex: 1,
    justifyContent: "center",
  },
  opaqueContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    marginTop: 200,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconButton: {
    width: 56,
    height: 56,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    backgroundColor: "white",
  },
  icon: {
    color: "black",
    fontSize: 32,
  },
  actionButton: {
    width: 56,
    height: 56,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});
