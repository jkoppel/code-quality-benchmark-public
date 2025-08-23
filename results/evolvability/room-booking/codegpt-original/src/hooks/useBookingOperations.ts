import { useCallback } from "react";
import { Booking } from "../types";
import { isHourBooked, validateBookingData } from "../utils/bookingUtils";

/**
 * Custom hook for booking operations
 * Encapsulates business logic and provides a clean interface
 */
export interface UseBookingOperationsProps {
  bookings: Booking[];
  onBook: (name: string, date: string, hour: number) => void;
}

export interface UseBookingOperationsReturn {
  isSlotAvailable: (date: string, hour: number) => boolean;
  handleBooking: (
    name: string,
    date: string,
    hour: number
  ) => { success: boolean; error?: string };
}

export const useBookingOperations = ({
  bookings,
  onBook,
}: UseBookingOperationsProps): UseBookingOperationsReturn => {
  const isSlotAvailable = useCallback(
    (date: string, hour: number): boolean => {
      return !isHourBooked(bookings, date, hour);
    },
    [bookings]
  );

  const handleBooking = useCallback(
    (
      name: string,
      date: string,
      hour: number
    ): { success: boolean; error?: string } => {
      // Validate booking data
      const validation = validateBookingData(name, date, hour);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Check if slot is still available
      if (!isSlotAvailable(date, hour)) {
        return {
          success: false,
          error: "This time slot is no longer available",
        };
      }

      try {
        onBook(name, date, hour);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create booking",
        };
      }
    },
    [bookings, onBook, isSlotAvailable]
  );

  return {
    isSlotAvailable,
    handleBooking,
  };
};
