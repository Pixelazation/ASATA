import { Alert } from "react-native";
import { MAPS_PLATFORM_KEY } from "@env";

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export const GeocodingApi = {
  reverseGeocode: async (latitude: number, longitude: number) => {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.append("latlng", `${latitude},${longitude}`);
      url.searchParams.append("key", MAPS_PLATFORM_KEY);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // This double-slash keeps me sane and functional. -Philippe
      if (!data.results || data.results.length === 0) {
        throw new Error("No results found for the given coordinates.");
      }

      const components: AddressComponent[] = data.results[0].address_components;

      const getComponent = (type: string) => {
        const comp = components.find((c: AddressComponent) => c.types.includes(type));
        return comp?.long_name || null;
      };

      const route = getComponent("route");
      const city = getComponent("locality") || getComponent("sublocality") || getComponent("administrative_area_level_2");
      const country = getComponent("country");

      return {
        fullAddress: `${route}, ${city}, ${country}`, // Combined address
        route,
        city,
        country,
      };
    } catch (error) {
      console.error("Error with geocoding:", error);
      Alert.alert("Geocoding Error", "Failed to reverse geocode the coordinates.");
      return null;
    }
  },
};
