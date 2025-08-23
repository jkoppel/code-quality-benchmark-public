import { useState, useCallback } from 'react';
import { Booking } from '../types';
import { createBooking, cancelBooking } from '../services/bookingService';

/**
 * Hook to manage booking state with centralized business logic
 */
export function useBookings(initialBookings: Booking[] = []) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const addBooking = useCallback(
    (roomName: string, date: string, startTime: string, endTime: string, userName: string) => {
      const newBookings = createBooking(roomName, date, startTime, endTime, userName);
      setBookings(prev => [...prev, ...newBookings]);
    },
    []
  );

  const removeBooking = useCallback(
    (bookingId: string) => {
      setBookings(prev => cancelBooking(prev, bookingId));
    },
    []
  );

  return {
    bookings,
    addBooking,
    removeBooking
  };
}
