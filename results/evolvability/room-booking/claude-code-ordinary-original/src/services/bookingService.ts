import { Booking, Room } from '../types';

export class BookingService {
  static generateBookingId(): string {
    return `${Date.now()}-${Math.random()}`;
  }

  static createSingleBooking(
    room: Room,
    name: string,
    date: string,
    hour: number
  ): Booking {
    return {
      id: this.generateBookingId(),
      roomId: room.id,
      name,
      date,
      hour
    };
  }

  static createVirtualBookings(
    room: Room,
    name: string,
    date: string,
    hour: number
  ): Booking[] {
    if (!room.isVirtual || !room.requiredRooms) {
      throw new Error('Room is not virtual or has no required rooms');
    }

    const baseBookingId = this.generateBookingId();
    const bookings: Booking[] = [];

    // Create bookings for required rooms
    room.requiredRooms.forEach(roomId => {
      bookings.push({
        id: `${baseBookingId}-${roomId}`,
        roomId,
        name,
        date,
        hour
      });
    });

    // Create booking for the virtual room itself
    bookings.push({
      id: baseBookingId,
      roomId: room.id,
      name,
      date,
      hour
    });

    return bookings;
  }

  static isHourAvailable(
    bookings: Booking[],
    date: string,
    hour: number
  ): boolean {
    return !bookings.some(
      booking => booking.date === date && booking.hour === hour
    );
  }

  static getBookingForSlot(
    bookings: Booking[],
    date: string,
    hour: number
  ): Booking | undefined {
    return bookings.find(
      booking => booking.date === date && booking.hour === hour
    );
  }
}