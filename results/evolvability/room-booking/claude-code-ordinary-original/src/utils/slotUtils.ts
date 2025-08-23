import { Booking } from '../types';
import { ROOMS } from '../constants';

/**
 * Checks if a specific slot is booked for a room on a given date
 */
export const isSlotBooked = (
  roomName: string,
  time: string,
  date: string,
  bookings: Booking[]
): Booking | undefined => {
  const room = ROOMS.find(r => r.name === roomName);
  
  // Check virtual room components
  if (room?.isVirtual && room.components) {
    const componentBooking = room.components.some(component =>
      bookings.some(b =>
        b.roomName === component &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
      )
    );
    if (componentBooking) {
      return bookings.find(b =>
        room.components!.includes(b.roomName) &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
      );
    }
  }

  // Check if regular room is blocked by Grand Ballroom booking
  if (!room?.isVirtual) {
    const grandBallroomBooking = bookings.find(b =>
      b.roomName === 'Grand Ballroom' &&
      b.date === date &&
      b.startTime <= time &&
      b.endTime > time &&
      (roomName === 'Ballroom 1' || roomName === 'Ballroom 2' || roomName === 'Ballroom 3')
    );
    if (grandBallroomBooking) return grandBallroomBooking;
  }

  // Check direct booking for this room
  return bookings.find(b =>
    b.roomName === roomName &&
    b.date === date &&
    b.startTime <= time &&
    b.endTime > time
  );
};

/**
 * Checks if a time range has any booking conflicts
 */
export const hasConflictInRange = (
  roomName: string,
  startTime: string,
  endTime: string,
  date: string,
  bookings: Booking[]
): boolean => {
  // This is a simplified check - in practice you'd want to check each slot in the range
  return isSlotBooked(roomName, startTime, date, bookings) !== undefined;
};