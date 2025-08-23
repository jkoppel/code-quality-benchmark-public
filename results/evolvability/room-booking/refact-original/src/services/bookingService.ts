import { Booking, Room } from '../types';
import { ROOMS } from '../constants/roomConfig';

/**
 * Get all bookings that affect a specific room's availability.
 * For virtual rooms, includes bookings from all required sub-rooms.
 * For sub-rooms that are part of virtual rooms, includes virtual room bookings.
 */
export function getBookingsForRoom(
  roomId: string,
  allBookings: Booking[]
): Booking[] {
  const room = ROOMS.find(r => r.id === roomId);
  if (!room) return [];

  // If this is a virtual room, show bookings from all required rooms + itself
  if (room.isVirtual && room.requiredRooms) {
    return allBookings.filter(booking => 
      booking.roomId === roomId || room.requiredRooms!.includes(booking.roomId)
    );
  }

  // If this room is part of a virtual room, also show virtual room bookings
  const parentVirtualRoom = findParentVirtualRoom(roomId);
  if (parentVirtualRoom) {
    return allBookings.filter(booking => 
      booking.roomId === roomId || booking.roomId === parentVirtualRoom.id
    );
  }

  // Normal room - just its own bookings
  return allBookings.filter(booking => booking.roomId === roomId);
}

/**
 * Create booking records when booking a room.
 * For virtual rooms, creates bookings for all required sub-rooms + the virtual room itself.
 */
export function createBookingsForRoom(
  room: Room,
  name: string,
  date: string,
  hour: number
): Booking[] {
  const baseId = `${Date.now()}-${Math.random()}`;
  const bookings: Booking[] = [];

  if (room.isVirtual && room.requiredRooms) {
    // Create bookings for all required sub-rooms
    room.requiredRooms.forEach(subRoomId => {
      bookings.push({
        id: `${baseId}-${subRoomId}`,
        roomId: subRoomId,
        name,
        date,
        hour
      });
    });

    // Also create a booking for the virtual room itself
    bookings.push({
      id: baseId,
      roomId: room.id,
      name,
      date,
      hour
    });
  } else {
    // Normal room - single booking
    bookings.push({
      id: baseId,
      roomId: room.id,
      name,
      date,
      hour
    });
  }

  return bookings;
}

/**
 * Find if a room is part of a virtual room's required rooms.
 */
function findParentVirtualRoom(roomId: string): Room | undefined {
  return ROOMS.find(room => 
    room.isVirtual && 
    room.requiredRooms && 
    room.requiredRooms.includes(roomId)
  );
}

/**
 * Check if a specific time slot is available for booking in a room.
 */
export function isTimeSlotAvailable(
  roomId: string,
  date: string,
  hour: number,
  allBookings: Booking[]
): boolean {
  const relevantBookings = getBookingsForRoom(roomId, allBookings);
  return !relevantBookings.some(booking => 
    booking.date === date && booking.hour === hour
  );
}
