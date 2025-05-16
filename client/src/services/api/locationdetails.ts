import { Alert } from "react-native";
import { supabase } from "../../lib/supabase"; // adjust the path as needed

const SUPABASE_EDGE_FUNCTION_URL = "https://pnliftjmwbgxvrynghyq.supabase.co/functions/v1/tripadvisor-proxy";

export const LocationDetailsApi = {
  getDetails: async (locationId: number) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) throw new Error("User is not authenticated");

      const url = new URL(`${SUPABASE_EDGE_FUNCTION_URL}/location/${locationId}/details`);
      url.searchParams.append("language", "en");
      url.searchParams.append("currency", "USD");

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
      console.error("Error fetching location details:", error.message ?? error);
      Alert.alert("Error", "Failed to fetch location details. Please try again.");
      return null;
    }
  },
};
