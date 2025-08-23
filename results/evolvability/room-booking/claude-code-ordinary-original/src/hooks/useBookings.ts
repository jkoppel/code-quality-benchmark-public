import { useState } from 'react';
import { Booking, Room } from '../types';
import { ROOMS } from '../constants/roomConfig';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const getBookingsForRoom = (roomId: string): Booking[] => {
    const room = ROOMS.find(r => r.id === roomId);
    
    if (room?.isVirtual && room.requiredRooms) {
      return bookings.filter(b => 
        room.requiredRooms!.includes(b.roomId) || b.roomId === roomId
      );
    }
    
    const grandBallroom = ROOMS.find(r => r.id === 'grand-ballroom');
    if (grandBallroom?.requiredRooms?.includes(roomId)) {
      return bookings.filter(b => 
        b.roomId === roomId || b.roomId === 'grand-ballroom'
      );
    }
    
    return bookings.filter(b => b.roomId === roomId);
  };

  const createBooking = (room: Room, name: string, date: string, hour: number) => {
    const newBookingId = `${Date.now()}-${Math.random()}`;
    
    if (room.isVirtual && room.requiredRooms) {
      const newBookings = room.requiredRooms.map(roomId => ({
        id: `${newBookingId}-${roomId}`,
        roomId,
        name,
        date,
        hour
      }));
      
      newBookings.push({
        id: newBookingId,
        roomId: room.id,
        name,
        date,
        hour
      });
      
      setBookings(prevBookings => [...prevBookings, ...newBookings]);
    } else {
      const newBooking: Booking = {
        id: newBookingId,
        roomId: room.id,
        name,
        date,
        hour
      };
      setBookings(prevBookings => [...prevBookings, newBooking]);
    }
  };

  return {
    bookings,
    getBookingsForRoom,
    createBooking,
  };
};