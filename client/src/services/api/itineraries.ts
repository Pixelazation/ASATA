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

  /** 📌 Track an itinerary for the logged-in user */
  static async trackItinerary(itineraryId: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("UserDetails")
      .update({ tracked_itinerary: itineraryId })
      .eq("user_id", user.id); // Assuming UserDetails has a user_id foreign key

    if (error) throw error;
    return data;
  }

  /** 📄 Fetch the currently tracked itinerary for the logged-in user */
  static async fetchTrackedItinerary() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("UserDetails")
      .select("tracked_itinerary")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data?.tracked_itinerary ?? null; // return null if none tracked
  }

  /** ❌ Untrack the currently tracked itinerary */
  static async untrackItinerary() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("UserDetails")
      .update({ tracked_itinerary: null })
      .eq("user_id", user.id);

    if (error) throw error;
    return data;
  }

  /** ➕ Add a new activity for the logged-in user */
  static async addActivity(itineraryId: string, activity: ActivityType) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");
  
    // 1. Reuse existing getActivities
    const existingActivities = await ItineraryApi.getActivities(itineraryId);
  
     // 2. Fetch itinerary to get start_date and end_date
    const { data: itineraryData, error: itineraryError } = await supabase
      .from("Itineraries")
      .select("start_date, end_date")
      .eq("id", itineraryId)
      .single(); // only 1 itinerary expected

    if (itineraryError || !itineraryData) throw new Error("Failed to fetch itinerary dates.");

    const itineraryStart = new Date(itineraryData.start_date).getTime();
    const itineraryEnd = new Date(itineraryData.end_date).getTime();

    const newStart = new Date(activity.start_time).getTime();
    const newEnd = new Date(activity.end_time).getTime();

    // 3. Check if activity is within itinerary dates
    if (newStart < itineraryStart || newStart > itineraryEnd || newEnd < itineraryStart || newEnd > itineraryEnd) {
      throw new Error("Activity must be within the itinerary dates.");
    }
  
    const hasOverlap = existingActivities.some(existing => {
      const existingStart = new Date(existing.start_time).getTime();
      const existingEnd = new Date(existing.end_time).getTime();
      
      return (newStart <= existingEnd && newStart >= existingStart) || (newEnd <= existingEnd && newEnd >= existingStart);
    });
  
    if (hasOverlap) {
      throw new Error("New activity overlaps with an existing activity.");
    }
  
    // 3. No overlap, insert
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
