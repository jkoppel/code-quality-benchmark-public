import { Booking, Room } from '../types';
import { ROOMS } from '../constants';

export const generateBookingId = (): string => {
  return `${Date.now()}-${Math.random()}`;
};

export const findRoomByName = (roomName: string): Room | undefined => {
  return ROOMS.find(r => r.name === roomName);
};

export const isVirtualRoom = (roomName: string): boolean => {
  const room = findRoomByName(roomName);
  return room?.isVirtual === true;
};

export const getVirtualRoomComponents = (roomName: string): string[] => {
  const room = findRoomByName(roomName);
  return room?.components || [];
};

export const isBallroomComponent = (roomName: string): boolean => {
  return ['Ballroom 1', 'Ballroom 2', 'Ballroom 3'].includes(roomName);
};

export const createBookingsForRoom = (
  roomName: string,
  date: string,
  startTime: string,
  endTime: string,
  userName: string
): Booking[] => {
  const bookings: Booking[] = [];
  const baseId = generateBookingId();

  // Create main booking
  const mainBooking: Booking = {
    id: baseId,
    roomName,
    date,
    startTime,
    endTime,
    userName
  };

  // Handle virtual room components
  if (isVirtualRoom(roomName)) {
    const components = getVirtualRoomComponents(roomName);
    components.forEach(component => {
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

  bookings.push(mainBooking);
  return bookings;
};

export const findRelatedBookingIds = (
  bookings: Booking[],
  targetBooking: Booking
): string[] => {
  const baseId = targetBooking.id.split('-')[0];
  
  // Handle Grand Ballroom unbooking - remove all related component bookings
  if (targetBooking.roomName === 'Grand Ballroom') {
    return bookings
      .filter(b => b.id.startsWith(baseId))
      .map(b => b.id);
  }

  // Handle virtual room component unbooking
  const room = findRoomByName(targetBooking.roomName);
  if (room?.isVirtual && room.components) {
    return bookings
      .filter(b => 
        b.id.startsWith(baseId) &&
        b.date === targetBooking.date &&
        b.startTime === targetBooking.startTime
      )
      .map(b => b.id);
  }

  return [targetBooking.id];
};