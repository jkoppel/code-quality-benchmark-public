import { Booking, Room } from '../types';
import { ROOMS } from '../constants';

/**
 * Strategy pattern for different booking behaviors
 */
export interface BookingStrategy {
  createBookings(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string
  ): Booking[];
  
  getRelatedBookings(
    bookingId: string,
    allBookings: Booking[]
  ): string[];
  
  canBook(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    existingBookings: Booking[]
  ): boolean;
}

/**
 * Standard booking strategy for regular rooms
 */
export class StandardBookingStrategy implements BookingStrategy {
  createBookings(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string
  ): Booking[] {
    return [{
      id: `${Date.now()}-${Math.random()}`,
      roomName,
      date,
      startTime,
      endTime,
      userName
    }];
  }
  
  getRelatedBookings(bookingId: string, allBookings: Booking[]): string[] {
    return [bookingId];
  }
  
  canBook(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    existingBookings: Booking[]
  ): boolean {
    return !existingBookings.some(booking =>
      booking.roomName === roomName &&
      booking.date === date &&
      this.timesOverlap(startTime, endTime, booking.startTime, booking.endTime)
    );
  }
  
  protected timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    return start1 < end2 && start2 < end1;
  }
}

/**
 * Virtual room booking strategy for composite rooms
 */
export class VirtualRoomBookingStrategy extends StandardBookingStrategy {
  constructor(private componentRooms: string[]) {
    super();
  }
  
  createBookings(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string
  ): Booking[] {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const baseId = `${timestamp}_${random}`;
    const bookings: Booking[] = [];
    
    // Create bookings for each component room
    this.componentRooms.forEach((componentRoom, index) => {
      bookings.push({
        id: `${baseId}_component_${index}`,
        roomName: componentRoom,
        date,
        startTime,
        endTime,
        userName
      });
    });
    
    // Add the main virtual room booking
    bookings.push({
      id: `${baseId}_main`,
      roomName,
      date,
      startTime,
      endTime,
      userName
    });
    
    return bookings;
  }
  
  getRelatedBookings(bookingId: string, allBookings: Booking[]): string[] {
    // Extract the base ID from the booking ID
    // IDs are now in format: timestamp_random_component_N or timestamp_random_main
    const parts = bookingId.split('_');
    
    if (parts.length < 2) {
      // Fallback for old format or standard bookings
      return [bookingId];
    }
    
    // Base ID is timestamp_random
    const baseId = `${parts[0]}_${parts[1]}`;
    
    // Find all bookings that share the same base ID
    return allBookings
      .filter(b => b.id.startsWith(baseId))
      .map(b => b.id);
  }
  
  canBook(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    existingBookings: Booking[]
  ): boolean {
    // Check if any component room is booked
    return !this.componentRooms.some(componentRoom =>
      existingBookings.some(booking =>
        booking.roomName === componentRoom &&
        booking.date === date &&
        this.timesOverlap(startTime, endTime, booking.startTime, booking.endTime)
      )
    );
  }
}

/**
 * Factory for creating appropriate booking strategies
 */
export class BookingStrategyFactory {
  static createStrategy(room: Room): BookingStrategy {
    if (room.isVirtual && room.components) {
      return new VirtualRoomBookingStrategy(room.components);
    }
    return new StandardBookingStrategy();
  }
  
  static getStrategyForRoom(roomName: string): BookingStrategy {
    const room = ROOMS.find(r => r.name === roomName);
    if (!room) {
      throw new Error(`Room ${roomName} not found`);
    }
    return this.createStrategy(room);
  }
}