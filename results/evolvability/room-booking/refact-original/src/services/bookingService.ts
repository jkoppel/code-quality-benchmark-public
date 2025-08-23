import { Booking, Room } from '../types';
import { ROOMS } from '../constants';

/**
 * Build one or more Booking records for a room (handles virtual/composite rooms).
 */
export function createBooking(
  roomName: string,
  date: string,
  startTime: string,
  endTime: string,
  userName: string
): Booking[] {
  const baseId = `${Date.now()}-${Math.random()}`;
  const room = ROOMS.find(r => r.name === roomName);
  if (!room) return [];

  // Always book the "main" room
  const bookings: Booking[] = [{
    id: baseId,
    roomName,
    date,
    startTime,
    endTime,
    userName
  }];

  // If it's a virtual room, also book each component
  if (room.isVirtual && room.components) {
    room.components.forEach(component => {
      bookings.push({
        id: `${baseId}-${component}`,
        roomName: component,
        date,
        startTime,
        endTime,
        userName
      });
    });
  }

  return bookings;
}

/**
 * Cancel a booking and all its related records by finding all bookings
 * that share the same base ID prefix.
 */
export function cancelBooking(allBookings: Booking[], bookingId: string): Booking[] {
  const bookingToRemove = allBookings.find(b => b.id === bookingId);
  
  if (!bookingToRemove) {
    return allBookings;
  }

  let bookingsToRemove = [bookingId];
  
  // Handle virtual room cancellation
  const room = ROOMS.find(r => r.name === bookingToRemove.roomName);
  if (room?.isVirtual && room.components) {
    const relatedBookings = allBookings.filter(b =>
      b.id.startsWith(bookingId.split('-')[0]) &&
      b.date === bookingToRemove.date &&
      b.startTime === bookingToRemove.startTime
    );
    bookingsToRemove = relatedBookings.map(b => b.id);
  }
  
  // Handle Grand Ballroom cancellation (special case)
  if (bookingToRemove.roomName === 'Grand Ballroom') {
    const baseId = bookingId.split('-')[0];
    bookingsToRemove = allBookings
      .filter(b => b.id.startsWith(baseId))
      .map(b => b.id);
  }
  
  return allBookings.filter(b => !bookingsToRemove.includes(b.id));
}

/**
 * Given a room, date, time slot, and all bookings, return the Booking
 * that covers that time slot, or undefined if available.
 */
export function findBookingAtTime(
  allBookings: Booking[],
  room: Room,
  date: string,
  time: string
): Booking | undefined {
  // If virtual room, check if any component is booked
  if (room.isVirtual && room.components) {
    const componentBooking = room.components.some(component =>
      allBookings.some(b =>
        b.roomName === component &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
      )
    );
    if (componentBooking) {
      return allBookings.find(b =>
        room.components!.includes(b.roomName) &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
      );
    }
  }

  // If this is a component of Grand Ballroom, check for Grand Ballroom booking
  if (!room.isVirtual) {
    const grandBallroomBooking = allBookings.find(b =>
      b.roomName === 'Grand Ballroom' &&
      b.date === date &&
      b.startTime <= time &&
      b.endTime > time &&
      (room.name === 'Ballroom 1' || room.name === 'Ballroom 2' || room.name === 'Ballroom 3')
    );
    if (grandBallroomBooking) return grandBallroomBooking;
  }

  // Check for direct booking
  return allBookings.find(b =>
    b.roomName === room.name &&
    b.date === date &&
    b.startTime <= time &&
    b.endTime > time
  );
}

/**
 * Check if a time range has any conflicts for a given room
 */
export function hasTimeRangeConflict(
  allBookings: Booking[],
  room: Room,
  date: string,
  startTime: string,
  endTime: string,
  timeSlots: string[]
): boolean {
  const startIndex = timeSlots.indexOf(startTime);
  const endIndex = timeSlots.indexOf(endTime);
  
  if (startIndex === -1 || endIndex === -1) return true;
  
  return timeSlots.slice(startIndex, endIndex).some(time =>
    findBookingAtTime(allBookings, room, date, time)
  );
}
