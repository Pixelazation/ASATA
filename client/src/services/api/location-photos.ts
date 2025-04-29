import { Alert } from "react-native";
import { TRIPADVISOR_API_KEY } from "@env";

export const LocationPhotosApi = {
  getPhotos: async (locationId: number, limit: number = 10, offset: number = 0, source: string = "all") => {
    try {
      const url = new URL(`https://api.content.tripadvisor.com/api/v1/location/${locationId}/photos`);
      url.searchParams.append("key", TRIPADVISOR_API_KEY);
      url.searchParams.append("language", "en");
      url.searchParams.append("limit", limit.toString());
      url.searchParams.append("offset", offset.toString());
      url.searchParams.append("source", source);

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
      console.error("Error fetching location photos:", error);
      Alert.alert("Error", "Failed to fetch location photos. Please try again.");
      return null;
    }
  },
};