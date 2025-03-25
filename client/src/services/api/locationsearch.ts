import { Alert } from "react-native";
import { TRIPADVISOR_API_KEY } from "@env";

export const LocationSearchApi = {
  search: async (query: string, category?: string) => {
    try {
      const url = new URL("https://api.content.tripadvisor.com/api/v1/location/search");
      url.searchParams.append("key", TRIPADVISOR_API_KEY);
      url.searchParams.append("searchQuery", encodeURIComponent(query));
      if (category) url.searchParams.append("category", category);
      url.searchParams.append("language", "en");

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
      console.error("Error fetching location data:", error);
      Alert.alert("Error", "Failed to fetch locations. Please try again.");
      return null;
    }
  },
};