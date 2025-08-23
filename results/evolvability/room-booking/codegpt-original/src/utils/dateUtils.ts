/**
 * Utility functions for date and time formatting
 * Following Single Responsibility Principle
 */

/**
 * Formats an hour number to a readable time string
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Formatted time string (e.g., "1:00 PM")
 */
export const formatHour = (hour: number): string => {
  if (hour < 0 || hour > 23) {
    throw new Error("Hour must be between 0 and 23");
  }

  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
};

/**
 * Gets the current date in YYYY-MM-DD format
 * @returns Current date string
 */
export const getCurrentDateString = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Validates if a date string is in the correct format
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export const isValidDateString = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Formats a date string for display
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!isValidDateString(dateString)) {
    throw new Error("Invalid date string format");
  }

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
