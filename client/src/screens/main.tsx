import React, { useEffect } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text } from "react-native";
import { View, Button } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";
import { useServices } from "@app/services";
import { ItineraryTracker } from "../components/itinerary-tracker";
import { BG_IMAGE } from "@app/assets";
import { SafeAreaView } from "react-native-safe-area-context";
import {Icon, IconName} from '@app/components/icon';

export type Params = {
  type?: "push" | "show";
  productId?: string;
};

export const Main: NavioScreen = observer(() => {
  const { navio } = useServices();
  const navigation = navio.useN();

  // Start
  useEffect(() => {
    configureUI();
  }, []);

  const configureUI = () => {
    navigation.setOptions({});
  };

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

            <Text style={styles.carouselTitle}>Explore new places...</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
              <View style={styles.carouselItem}>
                <ImageBackground source={BG_IMAGE} style={styles.carouselItemBackground}>
                  <Text style={styles.carouselItemText}>Recommendation 1</Text>
                </ImageBackground>
              </View>
              <View style={styles.carouselItem}>
                <ImageBackground source={BG_IMAGE} style={styles.carouselItemBackground}>
                  <Text style={styles.carouselItemText}>Recommendation 2</Text>
                </ImageBackground>
              </View>
              <View style={styles.carouselItem}>
                <ImageBackground source={BG_IMAGE} style={styles.carouselItemBackground}>
                  <Text style={styles.carouselItemText}>Recommendation 3</Text>
                </ImageBackground>
              </View>
            </ScrollView>
            
            <Text style={styles.carouselTitle}>Promotions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
              <View style={styles.carouselItem}>
                <ImageBackground source={BG_IMAGE} style={styles.carouselItemBackground}>
                  <Text style={styles.carouselItemText}>Promotion 1</Text>
                </ImageBackground>
              </View>
              <View style={styles.carouselItem}>
                <ImageBackground source={BG_IMAGE} style={styles.carouselItemBackground}>
                  <Text style={styles.carouselItemText}>Promotion 2</Text>
                </ImageBackground>
              </View>
              <View style={styles.carouselItem}>
                <ImageBackground source={BG_IMAGE} style={styles.carouselItemBackground}>
                  <Text style={styles.carouselItemText}>Promotion 3</Text>
                </ImageBackground>
              </View>
            </ScrollView>
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
    backgroundColor: "white"
  },
  icon: {
    color: "black", 
    fontSize: 32
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  carousel: {
    marginBottom: 20,
  },
  carouselItem: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginHorizontal: 32,
  },
  carouselItemBackground: {
    width: 200,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  carouselItemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
