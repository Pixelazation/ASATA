import { format } from "date-fns";

export const formatDate = (timestamp: string): string => {
  return format(new Date(timestamp), "MMMM d, yyyy"); // Example: March 4, 2025
};

console.log("✅ formatDate function loaded!"); // Debugging log