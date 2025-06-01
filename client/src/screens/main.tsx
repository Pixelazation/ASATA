import React, { useEffect, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet } from "react-native";
import { View, Button, Text, TouchableOpacity } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";
import { useServices } from "@app/services";
import { ItineraryTracker } from "../components/itinerary-tracker";
import { Carousel } from "../components/carousel";
import { BG_IMAGE_2 } from "@app/assets";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, IconName } from "@app/components/icon";
import { LocationTracker } from "@app/components/location-tracker";
import { WeatherTracker } from "@app/components/weather-tracker";
import { NotificationsApi } from "@app/services/api/notifications";
import { supabase } from "../lib/supabase";
import { colors } from '../utils/designSystem';
import { UserApi } from '../services/api/user';
import { useStores } from '../stores';

export const Main: NavioScreen = observer(() => {
  const { navio } = useServices();
  const { auth } = useStores();
  const navigation = navio.useN();

  interface PromotionItem {
    title: string;
    image: { uri: string };
    link: string;
  }
  
  const [promotionItems, setPromotionItems] = useState<PromotionItem[]>([]);

  useEffect(() => {
    configureUI();
    NotificationsApi.requestNotificationPermissions(); // Ask for notification permissions
    fetchPromotionItems(); // Fetch data from Supabase
  }, []);

  const configureUI = () => {
    navigation.setOptions({});
  };

  const fetchPromotionItems = async () => {
    try {
      const { data, error } = await supabase
        .from("location_details_cache")
        .select("name, web_url, see_all_photos");

      if (error) {
        console.error("Error fetching promotion items:", error);
        return;
      }
      
      // Map the data to the required structure
      const items = data.map((item) => ({
        title: item.name,
        image: { uri: item.see_all_photos },
        link: item.web_url,
      }));

      setPromotionItems(items);
    } catch (error) {
      console.error("Unexpected error fetching promotion items:", error);
    }
  };
  
  const GetSuggestionButtons = () => {
    const categoryOptions = [
      { selectedOption: 'diner', label: 'Eat', icon: 'restaurant' },
      { selectedOption: 'recreation', label: 'Enjoy', icon: 'sunny' },
      { selectedOption: 'accommodation', label: 'Stay', icon: 'business' },
    ]

    return (
      <View style={styles.buttonRow}>
        {categoryOptions.map(({ selectedOption, label, icon }, index) => (
          <View key={index} style={{ alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => navio.push("GetSuggestions", { selectedOption })}
              style={styles.iconButton}
            >
              <Icon
                name={icon as IconName}
                color={styles.icon.color}
                size={styles.icon.fontSize}
              />
            </TouchableOpacity>
            <Text style={styles.label}>{label}</Text>
          </View>
        ))}
      </View>
    )
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BG_IMAGE_2} style={styles.background} imageStyle={{opacity: 0.5}}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome,
          </Text>
          <Text style={styles.welcomeName}>
            {auth.firstName ? auth.firstName : 'Traveler'}!
          </Text>
        </View>
        <ScrollView contentInsetAdjustmentBehavior="always">
          <View style={styles.opaqueContainer}>
            <View style={{gap: 16}}>
              <Text section textColor>
                Get Suggestions
              </Text>
              <View style={styles.buttonRow}>
                <GetSuggestionButtons />
              </View>
            </View>

            <ItineraryTracker />

            {/* <Carousel title="Explore new places..." items={recommendationItems} /> */}
            <Carousel title="Promotions" items={promotionItems} />
            {/* <LocationTracker /> */}
            {/* <WeatherTracker />
            <View style={styles.buttonRow}>
              <Button
                onPress={() => NotificationsApi.sendTestNotification("You have an activity today!")}
                style={styles.actionButton}
              >
                <Icon name="time-outline" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
              <Button
                onPress={() => NotificationsApi.sendTestNotification("Oh my! It appears to be raining. Do you wish to change your activity?")}
                style={styles.actionButton}
              >
                <Icon name="rainy-outline" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
              <Button
                onPress={() => NotificationsApi.sendTestNotification("You have arrived at an activity area.")}
                style={styles.actionButton}
              >
                <Icon name="location-outline" color={styles.icon.color} size={styles.icon.fontSize} />
              </Button>
            </View> */}
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
    backgroundColor: 'black',
    height:300,
  },
  header: {
    position: 'absolute',
    top: 36,
    left: 24,
    paddingBottom: 0,
  },
  welcomeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 32
  },
  welcomeName: {
    color: '#1EC485',
    fontWeight: 'bold',
    fontSize: 32
  },
  opaqueContainer: {
    display: 'flex',
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    marginTop: 200,
    gap: 16,
    zIndex: 1,
  },
  buttonRow: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-around",
  },
  iconButton: {
    width: 80, 
    aspectRatio: 1, 
    backgroundColor: colors.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: colors.primary,
    fontSize: 32,
  },
  label: {
    color: colors.placeholder,
    fontWeight: 'bold',
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
