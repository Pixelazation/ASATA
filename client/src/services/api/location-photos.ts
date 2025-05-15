import { Alert } from "react-native";
import { supabase } from "../../lib/supabase"; // adjust the path as needed

const SUPABASE_EDGE_FUNCTION_URL = "https://pnliftjmwbgxvrynghyq.supabase.co/functions/v1/tripadvisor-proxy";

export const LocationPhotosApi = {
  getPhotos: async (
    locationId: number,
    limit: number = 10,
    offset: number = 0,
    source: string = "all"
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) throw new Error("User is not authenticated");

      const url = new URL(`${SUPABASE_EDGE_FUNCTION_URL}/location/${locationId}/photos`);
      url.searchParams.append("language", "en");
      url.searchParams.append("limit", limit.toString());
      url.searchParams.append("offset", offset.toString());
      url.searchParams.append("source", source);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error("API Error Body:", errorBody);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching location photos:", error.message ?? error);
      Alert.alert("Error", "Failed to fetch location photos. Please try again.");
      return null;
    }
  },
};
