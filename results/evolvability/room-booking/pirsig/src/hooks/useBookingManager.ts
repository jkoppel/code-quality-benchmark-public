import { useState, useCallback } from 'react';
import { Booking } from '../types';
import { BookingService } from '../services/bookingService';
import { HOURS } from '../constants';

export interface BookingManagerState {
  bookings: Booking[];
  selectedDate: string;
}

export interface BookingManagerActions {
  addBooking: (roomName: string, date: string, startTime: string, endTime: string, userName: string) => boolean;
  removeBooking: (bookingId: string) => void;
  setSelectedDate: (date: string) => void;
  validateBooking: (roomName: string, date: string, startTime: string, endTime: string) => { valid: boolean; message?: string };
  getBookingForSlot: (roomName: string, time: string) => Booking | undefined;
}

export function useBookingManager(): BookingManagerState & BookingManagerActions {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const addBooking = useCallback((
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string
  ): boolean => {
    // Validate the booking first
    const validation = BookingService.canBook(
      roomName,
      date,
      startTime,
      endTime,
      bookings,
      HOURS
    );

    if (!validation.valid) {
      alert(validation.message || 'Cannot book this time slot');
      return false;
    }

    // Create the bookings
    const newBookings = BookingService.createBookings(
      roomName,
      date,
      startTime,
      endTime,
      userName,
      bookings
    );

    setBookings(prevBookings => [...prevBookings, ...newBookings]);
    return true;
  }, [bookings]);

  const removeBooking = useCallback((bookingId: string) => {
    const bookingIdsToRemove = BookingService.removeBookings(bookingId, bookings);
    setBookings(prevBookings => 
      prevBookings.filter(b => !bookingIdsToRemove.includes(b.id))
    );
  }, [bookings]);

  const validateBooking = useCallback((
    roomName: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    return BookingService.canBook(
      roomName,
      date,
      startTime,
      endTime,
      bookings,
      HOURS
    );
  }, [bookings]);

  const getBookingForSlot = useCallback((
    roomName: string,
    time: string
  ): Booking | undefined => {
    return BookingService.findBookingForSlot(
      roomName,
      selectedDate,
      time,
      bookings
    );
  }, [bookings, selectedDate]);

  return {
    bookings,
    selectedDate,
    addBooking,
    removeBooking,
    setSelectedDate,
    validateBooking,
    getBookingForSlot
  };
}