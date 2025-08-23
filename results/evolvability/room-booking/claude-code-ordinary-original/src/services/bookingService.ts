import { Booking } from '../types';
import { ROOMS, RESOURCES } from '../constants';
import { generateBookingId } from '../utils/bookingUtils';
import { isTimeSlotOverlapping } from '../utils/timeUtils';

export const createBooking = (
  roomName: string,
  date: string,
  startTime: string,
  endTime: string,
  userName: string,
  resources?: string[]
): Booking[] => {
  const room = ROOMS.find(r => r.name === roomName);
  const baseBookingId = generateBookingId();
  const newBookings: Booking[] = [];

  // Handle virtual room components
  if (room?.isVirtual && room.components) {
    room.components.forEach(component => {
      newBookings.push({
        id: `${baseBookingId}-${component}`,
        roomName: component,
        date,
        startTime,
        endTime,
        userName,
        resources
      });
    });
  }

  // Add the main booking
  newBookings.push({
    id: baseBookingId,
    roomName,
    date,
    startTime,
    endTime,
    userName,
    resources
  });

  return newBookings;
};

export const removeBooking = (bookingId: string, allBookings: Booking[]): string[] => {
  const bookingToRemove = allBookings.find(b => b.id === bookingId);
  
  if (!bookingToRemove) {
    return [];
  }

  let bookingsToRemove = [bookingId];
  
  // Handle virtual room component removal
  const room = ROOMS.find(r => r.name === bookingToRemove.roomName);
  if (room?.isVirtual && room.components) {
    const relatedBookings = allBookings.filter(b =>
      b.id.startsWith(bookingId.split('-')[0]) &&
      b.date === bookingToRemove.date &&
      b.startTime === bookingToRemove.startTime
    );
    bookingsToRemove = relatedBookings.map(b => b.id);
  }
  
  // Handle Grand Ballroom special case
  if (bookingToRemove.roomName === 'Grand Ballroom') {
    const baseId = bookingId.split('-')[0];
    bookingsToRemove = allBookings
      .filter(b => b.id.startsWith(baseId))
      .map(b => b.id);
  }
  
  return bookingsToRemove;
};

// Check if resources are available for the given time period
export const checkResourceAvailability = (
  resources: string[],
  date: string,
  startTime: string,
  endTime: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): boolean => {
  if (!resources || resources.length === 0) {
    return true;
  }

  for (const resource of resources) {
    const resourceConfig = Object.values(RESOURCES).find(r => r.name === resource);
    if (!resourceConfig) continue;

    const overlappingBookings = existingBookings.filter(booking => {
      if (excludeBookingId && booking.id === excludeBookingId) return false;
      if (booking.date !== date) return false;
      if (!booking.resources?.includes(resource)) return false;

      return isTimeSlotOverlapping(
        { startTime: booking.startTime, endTime: booking.endTime },
        { startTime, endTime }
      );
    });

    if (overlappingBookings.length >= resourceConfig.maxQuantity) {
      return false;
    }
  }

  return true;
};

// Get available resources for a time slot
export const getAvailableResources = (
  date: string,
  startTime: string,
  endTime: string,
  existingBookings: Booking[]
): string[] => {
  const availableResources: string[] = [];

  Object.values(RESOURCES).forEach(resourceConfig => {
    const overlappingBookings = existingBookings.filter(booking => {
      if (booking.date !== date) return false;
      if (!booking.resources?.includes(resourceConfig.name)) return false;

      return isTimeSlotOverlapping(
        { startTime: booking.startTime, endTime: booking.endTime },
        { startTime, endTime }
      );
    });

    if (overlappingBookings.length < resourceConfig.maxQuantity) {
      availableResources.push(resourceConfig.name);
    }
  });

  return availableResources;
};