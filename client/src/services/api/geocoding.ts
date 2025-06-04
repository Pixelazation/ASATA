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

  // ---------------------

  // reverseGeocode: debounce(reverseGeocodeImpl, 1000, {
  //   leading: false,
  //   trailing: true,
  // }),

  // forwardGeocode: debounce(forwardGeocodeImpl, 1000, {
  //   leading: false,
  //   trailing: true,
  // }),

  // ----------------------

  // reverseGeocode: async (latitude: number, longitude: number) => {
  //   try {
  //     const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  //     url.searchParams.append("latlng", `${latitude},${longitude}`);
  //     url.searchParams.append("key", MAPS_PLATFORM_KEY);

  //     const response = await fetch(url.toString(), {
  //       method: "GET",
  //       headers: { accept: "application/json" },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`API Error: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     // This double-slash keeps me sane and functional. -Philippe
  //     if (!data.results || data.results.length === 0) {
  //       throw new Error("No results found for the given coordinates.");
  //     }

  //     const components: AddressComponent[] = data.results[0].address_components;

  //     const getComponent = (type: string) => {
  //       const comp = components.find((c: AddressComponent) => c.types.includes(type));
  //       return comp?.long_name || null;
  //     };

  //     const route = getComponent("route");
  //     const city = getComponent("locality") || getComponent("sublocality") || getComponent("administrative_area_level_2");
  //     const country = getComponent("country");

  //     return {
  //       fullAddress: `${route ? (route + ", ") : ""}${city}, ${country}`, // Combined address
  //       route,
  //       city,
  //       country,
  //     };
  //   } catch (error) {
  //     console.error("Error with geocoding:", error);
  //     Alert.alert("Geocoding Error", "Failed to reverse geocode the coordinates.");
  //     return null;
  //   }
  // },

  // forwardGeocode: async (address: string) => {
  //   try {
  //     const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  //     url.searchParams.append("address", address);
  //     url.searchParams.append("key", MAPS_PLATFORM_KEY);

  //     const response = await fetch(url.toString(), {
  //       method: "GET",
  //       headers: { accept: "application/json" },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`API Error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     if (!data.results || data.results.length === 0) {
  //       throw new Error("No geocoding results.");
  //     }

  //     const location = data.results[0].geometry.location;
  //     return {
  //       lat: location.lat,
  //       lng: location.lng,
  //     };
  //   } catch (error) {
  //     console.error("Geocoding error:", error);
  //     return null;
  //   }
  // }
};
