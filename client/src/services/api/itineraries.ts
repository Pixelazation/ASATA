import { supabase } from "../../lib/supabase";
import { NotificationsApi } from './notifications';
import { UserApi } from './user';

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

  /** 🔍 Fetch details of a specific itinerary for the logged-in user */
  static async getItineraryDetails(itineraryId: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("Itineraries")
      .select("*")
      .eq("id", itineraryId)
      .eq("user_id", user.id) // Ensure the user owns this itinerary
      .single(); // Expect only one result

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
  static async addItinerary(itinerary: AddItineraryDTO): Promise<string> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("Itineraries")
      .insert([{ ...itinerary, user_id: user.id }]);
    if (error) throw error;

    // Fetch the latest itinerary for this user (assuming created_at exists)
    const { data: latest, error: fetchError } = await supabase
      .from("Itineraries")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;
    return latest[0].id;
  }

  /** 📌 Track an itinerary for the logged-in user */
  static async trackItinerary(itineraryId: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    await UserApi.updateTimezone();

    const currentTracked = await this.fetchTrackedItinerary();
    if (currentTracked) NotificationsApi.unscheduleItineraryNotifications(currentTracked);

    const { data, error } = await supabase
      .from("UserDetails")
      .update({ tracked_itinerary: itineraryId })
      .eq("user_id", user.id); // Assuming UserDetails has a user_id foreign key

    if (error) throw error;

    const existingActivities = await ItineraryApi.getActivities(itineraryId);
    if (!existingActivities || existingActivities.length === 0) {
      throw new Error("No activities found for this itinerary.");
    }

    existingActivities.forEach(async (activity: ActivityType) => {
      if (new Date(activity.start_time) > new Date(Date.now()))
        NotificationsApi.scheduleActivityNotifications(activity);
    });

    return data;
  }

  /** 📄 Fetch the currently tracked itinerary for the logged-in user */
  static async fetchTrackedItinerary(): Promise<string | null> {
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

    const currentTracked = await this.fetchTrackedItinerary();
    if (currentTracked) NotificationsApi.unscheduleItineraryNotifications(currentTracked);

    const { data, error } = await supabase
      .from("UserDetails")
      .update({ tracked_itinerary: null })
      .eq("user_id", user.id);

    if (error) throw error;
    return data;
  }

  /** ➕ Add a new activity for the logged-in user */
  static async addActivity(itineraryId: string, activity: ActivityType) {
    console.log("Adding activity:", activity, "to itinerary:", itineraryId);
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

  /** 📍 Get the current, next, or latest activity from the tracked itinerary */
  static async getCurrentOrRelevantActivity() {
    // Step 1: Get tracked itinerary ID using existing function
    const itineraryId = await ItineraryApi.fetchTrackedItinerary();
    if (!itineraryId) return null;

    // Step 2: Get all activities using existing function
    const activities = await ItineraryApi.getActivities(itineraryId);
    if (!activities || activities.length === 0) return null;

    const now = Date.now();

    // Step 3: Find current activity
    const current = activities.find((activity) => {
      const start = new Date(activity.start_time).getTime();
      const end = new Date(activity.end_time).getTime();
      return now >= start && now <= end;
    });
    if (current) return { status: "current", activity: current };

    // Step 4: Find upcoming activity
    const upcoming = activities.find((activity) => {
      const start = new Date(activity.start_time).getTime();
      return start > now;
    });
    if (upcoming) return { status: "upcoming", activity: upcoming };

    // Step 5: Find latest past activity
    const pastActivities = activities
      .filter((activity) => new Date(activity.end_time).getTime() < now)
      .sort((a, b) =>
        new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
      );
    if (pastActivities.length > 0) {
      return { status: "latest", activity: pastActivities[0] };
    }

    return null;
  }

  /** ✏️ Update an existing itinerary */
  static async updateItinerary(id: string, updates: Partial<ItineraryType>) {
    const { data, error } = await supabase
      .from("Itineraries")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    return data;
  }

  static async updateActivity(id: string, updates: Partial<ActivityType>) {
    const { data, error } = await supabase
      .from("Activities")
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

  /** Duplicate an itinerary and its activities */
  static async duplicateItinerary(itineraryId: string): Promise<string> {
    // 1. Fetch the itinerary
    const orig = await ItineraryApi.getItineraryDetails(itineraryId);
    if (!orig) throw new Error("Original itinerary not found");

    // 2. Create the new itinerary (remove id, tweak title)
    const { id, ...rest } = orig;
    const newItinerary = {
      ...rest,
      title: orig.title + " (Copy)",
      start_date: orig.start_date,
      end_date: orig.end_date,
      created_at: new Date()
    };
    const newId = await ItineraryApi.addItinerary(newItinerary as AddItineraryDTO);
    console.log(newId);
    
    if (!newId) {throw new Error("Failed to create duplicate itinerary");}
    // 3. Fetch activities for the original itinerary
    const activities = await ItineraryApi.getActivities(itineraryId);
    // 4. Duplicate each activity for the new itinerary
    console.log("Duplicating activities for new itinerary:", newId, activities);
    await supabase
      .from("Activities")
      .insert(activities.map(({ id, itinerary_id, ...a }) => ({ itinerary_id: newId, ...a })));
    return newId;
  }
  
}
