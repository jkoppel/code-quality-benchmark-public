import { useState, useCallback } from "react";
import { Booking } from "../types";
import { BookingService } from "../services/BookingService";

export interface TimeSlotSelection {
  selectedSlot: string | null;
  selectedEndSlot: string | null;
  showBookingForm: boolean;
}

export interface UseTimeSlotSelectionReturn extends TimeSlotSelection {
  handleSlotClick: (
    time: string,
    roomName: string,
    date: string,
    bookings: Booking[],
    timeSlots: string[]
  ) => void;
  resetSelection: () => void;
  setShowBookingForm: (show: boolean) => void;
  isInSelectedRange: (time: string, timeSlots: string[]) => boolean;
}

export const useTimeSlotSelection = (): UseTimeSlotSelectionReturn => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const resetSelection = useCallback(() => {
    setSelectedSlot(null);
    setSelectedEndSlot(null);
    setShowBookingForm(false);
  }, []);

  const isInSelectedRange = useCallback(
    (time: string, timeSlots: string[]): boolean => {
      if (!selectedSlot || !selectedEndSlot) return false;

      const startIndex = timeSlots.indexOf(selectedSlot);
      const endIndex = timeSlots.indexOf(selectedEndSlot);
      const currentIndex = timeSlots.indexOf(time);

      return currentIndex >= startIndex && currentIndex <= endIndex;
    },
    [selectedSlot, selectedEndSlot]
  );

  const handleSlotClick = useCallback(
    (
      time: string,
      roomName: string,
      date: string,
      bookings: Booking[],
      timeSlots: string[]
    ) => {
      const booking = BookingService.isSlotBooked(
        roomName,
        time,
        date,
        bookings
      );

      if (booking) {
        // Handle existing booking - this will be handled by parent component
        return { action: "unbook", booking };
      }

      if (!selectedSlot) {
        // First slot selection
        setSelectedSlot(time);
        setSelectedEndSlot(null);
        setShowBookingForm(false);
      } else if (!selectedEndSlot) {
        // Second slot selection
        const startIndex = timeSlots.indexOf(selectedSlot);
        const endIndex = timeSlots.indexOf(time);

        if (endIndex >= startIndex) {
          if (endIndex === startIndex) {
            // Same slot clicked - book just 30 minutes
            setShowBookingForm(true);
          } else {
            // Range selection - validate availability
            const validation = BookingService.validateBookingRange(
              roomName,
              selectedSlot,
              time,
              date,
              bookings,
              timeSlots
            );

            if (validation.isValid) {
              setSelectedEndSlot(time);
              setShowBookingForm(true);
            } else {
              // Reset selection on conflict
              resetSelection();
              return {
                action: "conflict",
                conflictingSlots: validation.conflictingSlots,
              };
            }
          }
        } else {
          // New start selection
          setSelectedSlot(time);
          setSelectedEndSlot(null);
          setShowBookingForm(false);
        }
      } else {
        // Reset and start new selection
        setSelectedSlot(time);
        setSelectedEndSlot(null);
        setShowBookingForm(false);
      }

      return { action: "select" };
    },
    [selectedSlot, selectedEndSlot, resetSelection]
  );

  return {
    selectedSlot,
    selectedEndSlot,
    showBookingForm,
    handleSlotClick,
    resetSelection,
    setShowBookingForm,
    isInSelectedRange,
  };
};
