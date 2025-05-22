type NotificationType = {
  user_id: string;
  activity_id?: string;
  itinerary_id?: string;
  title: string;
  body: string;
  schedule_time: Date | string;
}