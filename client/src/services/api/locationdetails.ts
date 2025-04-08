import { Alert } from "react-native";
import { TRIPADVISOR_API_KEY } from "@env";

export const LocationDetailsApi = {
  getDetails: async (locationId: number) => {
    try {
      const url = new URL(`https://api.content.tripadvisor.com/api/v1/location/${locationId}/details`);
      url.searchParams.append("key", TRIPADVISOR_API_KEY);
      url.searchParams.append("language", "en");
      url.searchParams.append("currency", "USD");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching location details:", error);
      Alert.alert("Error", "Failed to fetch location details. Please try again.");
      return null;
    }
  },
};