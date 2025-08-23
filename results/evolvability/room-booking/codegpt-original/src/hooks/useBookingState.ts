import { useState, useCallback } from "react";
import { getCurrentDateString } from "../utils/dateUtils";

/**
 * Custom hook for managing booking form state
 * Follows Single Responsibility Principle and provides a clean interface
 */
export interface UseBookingStateReturn {
  selectedDate: string;
  showBookingForm: boolean;
  selectedHour: number | null;
  bookingName: string;
  setSelectedDate: (date: string) => void;
  setShowBookingForm: (show: boolean) => void;
  setSelectedHour: (hour: number | null) => void;
  setBookingName: (name: string) => void;
  openBookingForm: (hour: number) => void;
  closeBookingForm: () => void;
  resetBookingForm: () => void;
}

export const useBookingState = (): UseBookingStateReturn => {
  const [selectedDate, setSelectedDate] = useState<string>(
    getCurrentDateString()
  );
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [bookingName, setBookingName] = useState<string>("");

  const openBookingForm = useCallback((hour: number) => {
    setSelectedHour(hour);
    setShowBookingForm(true);
  }, []);

  const closeBookingForm = useCallback(() => {
    setShowBookingForm(false);
  }, []);

  const resetBookingForm = useCallback(() => {
    setShowBookingForm(false);
    setBookingName("");
    setSelectedHour(null);
  }, []);

  return {
    selectedDate,
    showBookingForm,
    selectedHour,
    bookingName,
    setSelectedDate,
    setShowBookingForm,
    setSelectedHour,
    setBookingName,
    openBookingForm,
    closeBookingForm,
    resetBookingForm,
  };
};
