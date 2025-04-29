import { format } from "date-fns";

export const timestampToDateString = (timestamp: string): string => {
  return format(new Date(timestamp), "MMMM d, yyyy"); // Example: March 4, 2025
};

export function dateToDateString(date: Date): string {
  return format(date, "yyyy/MM/dd");
}