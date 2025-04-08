import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { Text, View, Button } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";

import { services, useServices } from "@app/services";
import { useAppearance } from "@app/utils/hooks";
import { SplashBanner } from "../components/splash-banner";
import { ItineraryTracker } from "../components/itinerary-tracker";

export type Params = {
  type?: "push" | "show";
  productId?: string;
};

export const Main: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const { t, navio } = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  // Start
  useEffect(() => {
    configureUI();
  }, []);

  const configureUI = () => {
    navigation.setOptions({});
  };

  return (
    <View flex bg-white>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <SplashBanner />
        <ItineraryTracker />
      </ScrollView>

      {/* Get Suggestions Button */}
      <View padding-20>
        <Button
          label="Get Suggestions"
          onPress={() => navio.push("GetSuggestions")}
          backgroundColor="#007AFF"
          color="white"
        />
      </View>
    </View>
  );
});

Main.options = (props) => ({
  title: ``,
});
