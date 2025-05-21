export interface ItineraryType {
  id: string;               // UUID string
  user_id: string;          // UUID string, foreign key to user
  title: string;
  start_date: string;       // ISO timestamp string (from timestamp with time zone)
  end_date: string;         // ISO timestamp string
  budget: number;           // numeric maps to number
  created_at: string;       // ISO timestamp string
  location: string;
  image_url?: string | null; // nullable text
}
