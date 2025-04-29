import { format } from "date-fns";

export const timestampToDateString = (timestamp: string): string => {
  return format(new Date(timestamp), "MMMM d, yyyy"); // Example: March 4, 2025
};

export const timestampToDateTimeString = (timestamp: string | Date): string => {
  return new Date(timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function dateToDateString(date: Date): string {
  return format(date, "yyyy/MM/dd");
}