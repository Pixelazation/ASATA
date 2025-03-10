import { supabase } from "@app/lib/supabase"; // Supabase client
import { TRIPADVISOR_API_KEY } from "@env"; // API Key from .env

const CACHE_EXPIRATION_HOURS = 24; // Adjust as needed

// Function to check the cache and fetch from API if needed
export async function getLocation(searchQuery: string) {
  // Step 1: Check if data exists in Supabase and is still fresh
  const { data: cachedData, error } = await supabase
    .from("locations_search_cache")
    .select("*")
    .eq("name", searchQuery)
    .gte("last_updated", new Date(Date.now() - CACHE_EXPIRATION_HOURS * 60 * 60 * 1000).toISOString()) // Check if it's fresh
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase error:", error);
  }

  if (cachedData) {
    console.log("Using cached data:", cachedData);
    return cachedData; // Use cached data
  }

  // Step 2: Fetch from Tripadvisor API if not cached or expired
  const url = `https://api.content.tripadvisor.com/api/v1/location/search?key=${TRIPADVISOR_API_KEY}&searchQuery=${encodeURIComponent(searchQuery)}&language=en`;

  try {
    const response = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
    const apiData = await response.json();

    if (!apiData || !apiData.data || apiData.data.length === 0) {
      throw new Error("No results found");
    }

    // Extract the first result (assuming most relevant)
    const location = apiData.data[0];

    // Step 3: Save new data to Supabase
    const { error: insertError } = await supabase.from("location_search_cache").upsert(
      {
        location_id: location.location_id,
        name: location.name,
        street1: location.address_obj?.street1 || null,
        street2: location.address_obj?.street2 || null,
        city: location.address_obj?.city || null,
        state: location.address_obj?.state || null,
        country: location.address_obj?.country || null,
        postalcode: location.address_obj?.postalcode || null,
        address_string: location.address_obj?.address_string || null,
        last_updated: new Date().toISOString(),
      },
      { onConflict: ["location_id"] } // Prevent duplicates
    );

    if (insertError) {
      console.error("Error saving to cache:", insertError);
    }

    return location; // Return fresh data
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
}
