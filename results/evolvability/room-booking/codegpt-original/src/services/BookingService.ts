import { Booking } from "../types";

/**
 * BookingService Interface
 * Follows Dependency Inversion Principle - depends on abstractions, not concretions
 */
export interface IBookingService {
  createBooking(
    name: string,
    roomId: string,
    date: string,
    hour: number
  ): Promise<Booking>;
  getBookingsForRoom(roomId: string): Promise<Booking[]>;
  getBookingsForDate(date: string): Promise<Booking[]>;
  cancelBooking(bookingId: string): Promise<void>;
}

/**
 * Mock BookingService Implementation
 * This can be easily replaced with a real API service
 * Follows Open/Closed Principle - open for extension, closed for modification
 */
export class MockBookingService implements IBookingService {
  private bookings: Booking[] = [];
  private nextId = 1;

  async createBooking(
    name: string,
    roomId: string,
    date: string,
    hour: number
  ): Promise<Booking> {
    // Simulate API delay
    await this.delay(500);

    // Check for conflicts
    const existingBooking = this.bookings.find(
      (b) => b.roomId === roomId && b.date === date && b.hour === hour
    );

    if (existingBooking) {
      throw new Error("This time slot is already booked");
    }

    const booking: Booking = {
      id: this.nextId.toString(),
      name: name.trim(),
      roomId,
      date,
      hour,
    };

    this.nextId++;
    this.bookings.push(booking);
    return booking;
  }

  async getBookingsForRoom(roomId: string): Promise<Booking[]> {
    await this.delay(200);
    return this.bookings.filter((b) => b.roomId === roomId);
  }

  async getBookingsForDate(date: string): Promise<Booking[]> {
    await this.delay(200);
    return this.bookings.filter((b) => b.date === date);
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await this.delay(300);
    const index = this.bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) {
      throw new Error("Booking not found");
    }
    this.bookings.splice(index, 1);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * BookingService Factory
 * Follows Factory Pattern for service creation
 */
export class BookingServiceFactory {
  private static instance: IBookingService;

  static getInstance(): IBookingService {
    if (!this.instance) {
      this.instance = new MockBookingService();
    }
    return this.instance;
  }

  static setInstance(service: IBookingService): void {
    this.instance = service;
  }
}
