import { useState } from 'react';
import { Booking, Room } from '../types';
import { getBookingsForRoom, createBookingsForRoom } from '../services/bookingService';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (
    room: Room,
    name: string,
    date: string,
    hour: number
  ) => {
    const newBookings = createBookingsForRoom(room, name, date, hour);
    setBookings(prevBookings => [...prevBookings, ...newBookings]);
  };

  const getForRoom = (roomId: string) => {
    return getBookingsForRoom(roomId, bookings);
  };

  return { 
    bookings, 
    addBooking, 
    getForRoom 
  };
}
