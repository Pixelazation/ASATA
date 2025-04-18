type ActivityType = {
  id?: string;
  name: string;
  start_time: Date;
  end_time: Date;
  cost: number;
  category: string
  description: string;
  [key: string]: any;
}