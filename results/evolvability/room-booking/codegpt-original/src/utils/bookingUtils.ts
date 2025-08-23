import { Booking } from "../types";

/**
 * Utility functions for booking operations
 * Following Single Responsibility Principle
 */

/**
 * Checks if a specific hour is booked for a given date
 * @param bookings - Array of bookings
 * @param date - Date string in YYYY-MM-DD format
 * @param hour - Hour to check (0-23)
 * @returns True if the hour is booked, false otherwise
 */
export const isHourBooked = (
  bookings: Booking[],
  date: string,
  hour: number
): boolean => {
  return bookings.some(
    (booking) => booking.date === date && booking.hour === hour
  );
};

/**
 * Finds a booking for a specific date and hour
 * @param bookings - Array of bookings
 * @param date - Date string in YYYY-MM-DD format
 * @param hour - Hour to find booking for (0-23)
 * @returns Booking if found, undefined otherwise
 */
export const findBookingByDateAndHour = (
  bookings: Booking[],
  date: string,
  hour: number
): Booking | undefined => {
  return bookings.find(
    (booking) => booking.date === date && booking.hour === hour
  );
};

/**
 * Validates booking data
 * @param name - Booking name
 * @param date - Date string
 * @param hour - Hour number
 * @returns Validation result with success flag and error message
 */
export const validateBookingData = (
  name: string,
  date: string,
  hour: number | null
): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: "Name is required" };
  }

  if (!date) {
    return { isValid: false, error: "Date is required" };
  }

  if (hour === null || hour < 0 || hour > 23) {
    return { isValid: false, error: "Valid hour is required" };
  }

  return { isValid: true };
};

/**
 * Filters bookings for a specific date
 * @param bookings - Array of all bookings
 * @param date - Date to filter by
 * @returns Array of bookings for the specified date
 */
export const getBookingsForDate = (
  bookings: Booking[],
  date: string
): Booking[] => {
  return bookings.filter((booking) => booking.date === date);
};
