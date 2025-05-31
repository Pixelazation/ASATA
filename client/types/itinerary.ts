type ItineraryType = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  budget: number;
  location: string;
  longitude?: number;
  latitude?: number;
  image_url?: string | null;
}

type AddItineraryDTO = Omit<ItineraryType, 'id'>;