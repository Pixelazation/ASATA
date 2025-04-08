import { supabase } from "../../lib/supabase";

export class ItineraryApi {
  /** 📌 Fetch all itineraries for the logged-in user */
  static async getItineraries() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("Itineraries")
      .select("*")
      .eq("user_id", user.id) // Use logged-in user's ID
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  static async getActivities(itineraryId: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("Activities")
      .select("*")
      .eq("itinerary_id", itineraryId)
      .order("start_time", { ascending: true });
    if (error) throw error;
    return data;
  }

  /** ➕ Add a new itinerary for the logged-in user */
  static async addItinerary(itinerary: {
    title: string;
    start_date: string;
    end_date: string;
    budget: number;
  }) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("Itineraries")
      .insert([{ ...itinerary, user_id: user.id }]); // Attach user_id automatically

    if (error) throw error;
    return data;
  }

  /** ➕ Add a new itinerary for the logged-in user */
  static async addActivity(
    itineraryId: string, 
    activity: ActivityType
  ) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("Activities")
      .insert([{ ...activity, itinerary_id: itineraryId }]);

    if (error) throw error;
    return data;
  }

  /** ✏️ Update an existing itinerary */
  static async updateItinerary(id: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from("Itineraries")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    return data;
  }
  /** ❌ Delete an itinerary */
  static async deleteItinerary(id: string) {
    const { error } = await supabase.from("Itineraries").delete().eq("id", id);
  
    if (error) {
        console.error("Error deleting itinerary from Supabase:", error);
        throw error;
    }
  }

  static async deleteActivity(
    activityId: string
  ) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("Activities")
      .delete()
      .eq("id", activityId);

    if (error) throw error;
    return data;
  }
  
}
