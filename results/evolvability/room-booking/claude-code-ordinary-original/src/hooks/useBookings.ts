import { useState, useCallback } from 'react';
import { Booking } from '../types';
import { createBooking, removeBooking } from '../services/bookingService';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = useCallback((
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string,
    resources?: string[]
  ) => {
    const newBookings = createBooking(roomName, date, startTime, endTime, userName, resources);
    setBookings(prev => [...prev, ...newBookings]);
  }, []);

  const removeBookingById = useCallback((bookingId: string) => {
    const bookingsToRemove = removeBooking(bookingId, bookings);
    setBookings(prev => prev.filter(b => !bookingsToRemove.includes(b.id)));
  }, [bookings]);

  return {
    bookings,
    addBooking,
    removeBookingById
  };
};