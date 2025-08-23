import { Booking } from '../types';
import { ROOMS } from '../constants';
import { BookingStrategyFactory } from '../patterns/BookingStrategy';
import { ValidationChainFactory } from '../patterns/Validator';
import { eventManager } from '../patterns/Observer';

export class BookingService {
  /**
   * Creates bookings for a room, handling virtual rooms that require multiple component bookings
   */
  static createBookings(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string,
    existingBookings: Booking[]
  ): Booking[] {
    // Validate the booking data
    const validator = ValidationChainFactory.createBookingValidationChain();
    const validation = validator.validate({ userName, date, startTime, endTime });
    
    if (!validation.valid) {
      throw new Error(validation.message || 'Invalid booking data');
    }
    
    // Use strategy pattern for booking creation
    const strategy = BookingStrategyFactory.getStrategyForRoom(roomName);
    const newBookings = strategy.createBookings(roomName, date, startTime, endTime, userName);
    
    // Notify observers
    eventManager.notify({
      type: 'booking.created',
      payload: { bookings: newBookings, roomName, date, startTime, endTime, userName },
      timestamp: new Date()
    });
    
    return newBookings;
  }

  /**
   * Removes a booking and all related bookings (for virtual rooms)
   */
  static removeBookings(
    bookingId: string,
    bookings: Booking[]
  ): string[] {
    const bookingToRemove = bookings.find(b => b.id === bookingId);
    
    if (!bookingToRemove) {
      return [];
    }
    
    // Use strategy pattern to find related bookings
    const strategy = BookingStrategyFactory.getStrategyForRoom(bookingToRemove.roomName);
    const bookingIdsToRemove = strategy.getRelatedBookings(bookingId, bookings);
    
    // Notify observers
    eventManager.notify({
      type: 'booking.cancelled',
      payload: { bookingIds: bookingIdsToRemove, booking: bookingToRemove },
      timestamp: new Date()
    });
    
    return bookingIdsToRemove;
  }

  /**
   * Checks if a room is a component of any virtual room
   */
  static isComponentOfVirtualRoom(roomName: string): boolean {
    return ROOMS.some(room => 
      room.isVirtual && 
      room.components?.includes(roomName)
    );
  }

  /**
   * Finds a booking for a specific time slot
   */
  static findBookingForSlot(
    roomName: string,
    date: string,
    time: string,
    bookings: Booking[]
  ): Booking | undefined {
    const room = ROOMS.find(r => r.name === roomName);
    
    // For virtual rooms, look for the main virtual room booking first
    if (room?.isVirtual && room.components) {
      // First check for the main virtual room booking
      const virtualBooking = bookings.find(b =>
        b.roomName === roomName &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
      );
      if (virtualBooking) return virtualBooking;
      
      // If no main booking found, check component bookings
      const componentBooking = bookings.find(b =>
        room.components!.includes(b.roomName) &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
      );
      if (componentBooking) {
        // Return the main booking associated with this component
        const bookingId = componentBooking.id;
        const parts = bookingId.split('_');
        if (parts.length >= 2) {
          const baseId = `${parts[0]}_${parts[1]}`;
          const mainBooking = bookings.find(b => b.id === `${baseId}_main`);
          if (mainBooking) return mainBooking;
        }
        return componentBooking;
      }
    }

    // Check if this component room is booked via virtual room
    if (this.isComponentOfVirtualRoom(roomName)) {
      const virtualRooms = ROOMS.filter(r => 
        r.isVirtual && 
        r.components?.includes(roomName)
      );
      
      for (const virtualRoom of virtualRooms) {
        const virtualBooking = bookings.find(b =>
          b.roomName === virtualRoom.name &&
          b.date === date &&
          b.startTime <= time &&
          b.endTime > time
        );
        if (virtualBooking) return virtualBooking;
      }
    }

    // Check direct booking
    return bookings.find(b =>
      b.roomName === roomName &&
      b.date === date &&
      b.startTime <= time &&
      b.endTime > time
    );
  }

  /**
   * Validates if a booking can be made for the given time range
   */
  static canBook(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    bookings: Booking[],
    timeSlots: string[]
  ): { valid: boolean; message?: string } {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex === -1 || endIndex === -1) {
      return { valid: false, message: 'Invalid time selection' };
    }
    
    if (endIndex <= startIndex) {
      return { valid: false, message: 'End time must be after start time' };
    }

    // Check for conflicts in the selected range
    for (let i = startIndex; i < endIndex; i++) {
      const existingBooking = this.findBookingForSlot(
        roomName,
        date,
        timeSlots[i],
        bookings
      );
      
      if (existingBooking) {
        return { 
          valid: false, 
          message: `Time slot ${timeSlots[i]} is already booked by ${existingBooking.userName}` 
        };
      }
    }

    return { valid: true };
  }

  /**
   * Gets all bookings for a specific room and date
   */
  static getBookingsForRoomAndDate(
    roomName: string,
    date: string,
    bookings: Booking[]
  ): Booking[] {
    return bookings.filter(b => 
      b.roomName === roomName && 
      b.date === date
    );
  }
}