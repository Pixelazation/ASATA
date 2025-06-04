import { Alert } from "react-native";
import { debounceAsync } from '../../utils/debounceAsync';

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

const reverseGeocodeImpl = async (latitude: number, longitude: number) => {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.append("format", "json");
    url.searchParams.append("lat", latitude.toString());
    url.searchParams.append("lon", longitude.toString());
    url.searchParams.append("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "User-Agent": "ASATA/1.0 (https://github.com/Pixelazation/ASATA)",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    const { address, display_name } = data;
    const city = address.city || address.town || address.village || address.state_district;
    const country = address.country;
    const route = address.road || null;

    console.log(address);

    return {
      fullAddress: display_name,
      route,
      city,
      country,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    Alert.alert("Geocoding Error", "Failed to reverse geocode the coordinates.");
    return null;
  }
};

const forwardGeocodeImpl = async (address: string) => {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.append("format", "json");
    url.searchParams.append("q", address);
    url.searchParams.append("limit", "1");
    url.searchParams.append("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "User-Agent": "ASATA/1.0 (https://github.com/Pixelazation/ASATA)",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error("No geocoding results.");
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    Alert.alert("Geocoding Error", "Failed to forward geocode the coordinates.");
    return null;
  }
};

export const GeocodingApi = {
  reverseGeocode: debounceAsync(reverseGeocodeImpl, 1000),
  forwardGeocode: debounceAsync(forwardGeocodeImpl, 1000),
};
