import { Alert } from "react-native";
import { supabase } from "../../lib/supabase"; // adjust path if needed
import { SUPABASE_URL } from '@env';

const SUPABASE_EDGE_FUNCTION_URL = SUPABASE_URL + "/functions/v1/tripadvisor-proxy";

export const LocationSearchApi = {
  search: async (query: string, category?: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) throw new Error("User is not authenticated");

      const url = new URL(`${SUPABASE_EDGE_FUNCTION_URL}/location/search`);
      url.searchParams.append("searchQuery", query);
      url.searchParams.append("language", "en");
      if (category) url.searchParams.append("category", category);

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
      console.error("Error fetching location data:", error.message ?? error);
      Alert.alert("Error", "Failed to fetch locations. Please try again.");
      return null;
    }
  },
};
