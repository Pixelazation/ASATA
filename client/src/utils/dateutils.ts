import { format } from "date-fns";

export const timestampToDateString = (timestamp: string): string => {
  return format(new Date(timestamp), "MMMM d, yyyy"); // Example: March 4, 2025
};

export const timestampToDateTimeString = (timestamp: string | Date): string => {
  return new Date(timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export const monthFromTimestamp = (timestamp: string | Date): string => {
  return new Date(timestamp).toLocaleString('en-US', { month: 'short' });
}

export const dayFromTimestamp = (timestamp: string | Date): string => {
  return new Date(timestamp).toLocaleString('en-US', { day: '2-digit' });
}

export const timeAndDayOfWeekFromTimestamp = (timestamp: string | Date): string => {
  return format(new Date(timestamp), "EE, hh:mm a"); // Example: Monday, 12:00 AM
}

export function dateToDateString(date: Date): string {
  return format(date, "yyyy/MM/dd");
}