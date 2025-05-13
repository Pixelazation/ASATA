type ItineraryType = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  budget: number;
  location: string;
  image_url?: string | null;
}

type AddItineraryDTO = Omit<ItineraryType, 'id'>;