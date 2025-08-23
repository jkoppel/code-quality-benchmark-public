import { useState, useCallback } from 'react';
import { Booking } from '../types';
import { 
  createBookingsForRoom, 
  findRelatedBookingIds, 
  findRoomByName,
  isBallroomComponent 
} from '../utils/bookingUtils';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = useCallback((
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string
  ) => {
    const newBookings = createBookingsForRoom(roomName, date, startTime, endTime, userName);
    setBookings(prev => [...prev, ...newBookings]);
  }, []);

  const removeBooking = useCallback((bookingId: string) => {
    setBookings(prev => {
      const targetBooking = prev.find(b => b.id === bookingId);
      
      if (!targetBooking) {
        return prev;
      }

      const idsToRemove = findRelatedBookingIds(prev, targetBooking);
      return prev.filter(b => !idsToRemove.includes(b.id));
    });
  }, []);

  const findBookingAtSlot = useCallback((roomName: string, date: string, time: string): Booking | undefined => {
    const room = findRoomByName(roomName);
    
    // Check virtual room components
    if (room?.isVirtual && room.components) {
      const componentBooking = room.components.find(component =>
        bookings.some(b =>
          b.roomName === component &&
          b.date === date &&
          b.startTime <= time &&
          b.endTime > time
        )
      );

      if (componentBooking) {
        return bookings.find(b =>
          b.roomName === componentBooking &&
          b.date === date &&
          b.startTime <= time &&
          b.endTime > time
        );
      }
    }

    // Check Grand Ballroom conflicts with ballroom components
    if (!room?.isVirtual && isBallroomComponent(roomName)) {
      const grandBallroomBooking = bookings.find(b =>
        b.roomName === 'Grand Ballroom' &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
      );
      if (grandBallroomBooking) {
        return grandBallroomBooking;
      }
    }

    // Check direct booking
    return bookings.find(b =>
      b.roomName === roomName &&
      b.date === date &&
      b.startTime <= time &&
      b.endTime > time
    );
  }, [bookings]);

  return {
    bookings,
    addBooking,
    removeBooking,
    findBookingAtSlot
  };
};