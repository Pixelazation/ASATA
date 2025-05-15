type ActivityType = {
  id?: string;
  itinerary_id?: string;
  name: string;
  start_time: Date;
  end_time: Date;
  cost: number;
  category: string
  description: string;
  location: string;
  image_url?: string | null;
  [key: string]: any;
}