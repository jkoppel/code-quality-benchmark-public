import { Booking, Room } from "../types";
import { ROOMS } from "../constants";

export class BookingService {
  /**
   * Checks if a time slot is booked for a specific room
   */
  public static isSlotBooked(
    roomName: string,
    time: string,
    date: string,
    bookings: Booking[]
  ): Booking | undefined {
    const room = ROOMS.find((r) => r.name === roomName);

    // Handle virtual room bookings (like Grand Ballroom)
    if (room?.isVirtual && room.components) {
      return this.checkVirtualRoomBooking(room, time, date, bookings);
    }

    // Handle component rooms that might be affected by virtual room bookings
    if (!room?.isVirtual) {
      const virtualRoomBooking = this.checkVirtualRoomConflict(
        roomName,
        time,
        date,
        bookings
      );
      if (virtualRoomBooking) return virtualRoomBooking;
    }

    // Check direct booking for the room
    return this.findDirectBooking(roomName, time, date, bookings);
  }

  /**
   * Validates if a booking range is available
   */
  public static validateBookingRange(
    roomName: string,
    startTime: string,
    endTime: string,
    date: string,
    bookings: Booking[],
    timeSlots: string[]
  ): { isValid: boolean; conflictingSlots: string[] } {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return { isValid: false, conflictingSlots: [] };
    }

    const conflictingSlots: string[] = [];
    const slotsToCheck = timeSlots.slice(startIndex, endIndex);

    for (const slot of slotsToCheck) {
      if (this.isSlotBooked(roomName, slot, date, bookings)) {
        conflictingSlots.push(slot);
      }
    }

    return {
      isValid: conflictingSlots.length === 0,
      conflictingSlots,
    };
  }

  /**
   * Creates a new booking
   */
  public static createBooking(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string
  ): Booking {
    return {
      id: this.generateBookingId(),
      roomName,
      date,
      startTime,
      endTime,
      userName: userName.trim(),
    };
  }

  private static checkVirtualRoomBooking(
    room: Room,
    time: string,
    date: string,
    bookings: Booking[]
  ): Booking | undefined {
    const componentBooking = room.components!.some((component) =>
      bookings.some(
        (b) =>
          b.roomName === component &&
          b.date === date &&
          b.startTime <= time &&
          b.endTime > time
      )
    );

    if (componentBooking) {
      return bookings.find(
        (b) =>
          room.components!.includes(b.roomName) &&
          b.date === date &&
          b.startTime <= time &&
          b.endTime > time
      );
    }

    return undefined;
  }

  private static checkVirtualRoomConflict(
    roomName: string,
    time: string,
    date: string,
    bookings: Booking[]
  ): Booking | undefined {
    // Check if Grand Ballroom is booked (affects Ballroom 1, 2, 3)
    const ballroomComponents = ["Ballroom 1", "Ballroom 2", "Ballroom 3"];

    if (ballroomComponents.includes(roomName)) {
      return bookings.find(
        (b) =>
          b.roomName === "Grand Ballroom" &&
          b.date === date &&
          b.startTime <= time &&
          b.endTime > time
      );
    }

    return undefined;
  }

  private static findDirectBooking(
    roomName: string,
    time: string,
    date: string,
    bookings: Booking[]
  ): Booking | undefined {
    return bookings.find(
      (b) =>
        b.roomName === roomName &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
    );
  }

  private static generateBookingId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
