import { Booking, Room } from "../types";

/**
 * Test Utilities
 * Helper functions for testing the booking system
 * Follows Test Data Builder Pattern
 */

/**
 * Creates a mock room for testing
 */
export const createMockRoom = (overrides: Partial<Room> = {}): Room => ({
  id: "test-room-1",
  name: "Test Room",
  ...overrides,
});

/**
 * Creates a mock virtual room for testing
 */
export const createMockVirtualRoom = (overrides: Partial<Room> = {}): Room => ({
  id: "virtual-room-1",
  name: "Virtual Conference Room",
  isVirtual: true,
  requiredRooms: ["room-1", "room-2", "room-3"],
  ...overrides,
});

/**
 * Creates a mock booking for testing
 */
export const createMockBooking = (
  overrides: Partial<Booking> = {}
): Booking => ({
  id: "test-booking-1",
  roomId: "test-room-1",
  name: "John Doe",
  date: "2024-01-15",
  hour: 10,
  ...overrides,
});

/**
 * Creates multiple mock bookings for testing
 */
export const createMockBookings = (
  count: number,
  baseBooking: Partial<Booking> = {}
): Booking[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockBooking({
      ...baseBooking,
      id: `test-booking-${index + 1}`,
      hour: (baseBooking.hour || 9) + index,
    })
  );
};

/**
 * Creates a date string for testing (YYYY-MM-DD format)
 */
export const createTestDate = (daysFromToday: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split("T")[0];
};

/**
 * Creates mock booking data for a full day
 */
export const createFullDayBookings = (
  roomId: string,
  date: string,
  hours: number[] = [9, 10, 11, 14, 15, 16]
): Booking[] => {
  return hours.map((hour, index) =>
    createMockBooking({
      id: `booking-${roomId}-${date}-${hour}`,
      roomId,
      date,
      hour,
      name: `User ${index + 1}`,
    })
  );
};

/**
 * Test data scenarios
 */
export const testScenarios = {
  // Empty calendar
  emptyCalendar: {
    room: createMockRoom(),
    bookings: [],
  },

  // Partially booked calendar
  partiallyBooked: {
    room: createMockRoom(),
    bookings: createMockBookings(3, { date: createTestDate() }),
  },

  // Fully booked calendar
  fullyBooked: {
    room: createMockRoom(),
    bookings: createFullDayBookings("test-room-1", createTestDate()),
  },

  // Virtual room scenario
  virtualRoom: {
    room: createMockVirtualRoom(),
    bookings: createMockBookings(2, {
      roomId: "virtual-room-1",
      date: createTestDate(),
    }),
  },

  // Multi-day bookings
  multiDay: {
    room: createMockRoom(),
    bookings: [
      ...createFullDayBookings("test-room-1", createTestDate()),
      ...createFullDayBookings("test-room-1", createTestDate(1)),
      ...createMockBookings(2, { date: createTestDate(2) }),
    ],
  },
};

/**
 * Assertion helpers for testing
 */
export const testAssertions = {
  /**
   * Checks if a booking exists in the array
   */
  hasBooking: (
    bookings: Booking[],
    roomId: string,
    date: string,
    hour: number
  ): boolean => {
    return bookings.some(
      (b) => b.roomId === roomId && b.date === date && b.hour === hour
    );
  },

  /**
   * Counts bookings for a specific date
   */
  countBookingsForDate: (bookings: Booking[], date: string): number => {
    return bookings.filter((b) => b.date === date).length;
  },

  /**
   * Gets available hours for a date
   */
  getAvailableHours: (
    bookings: Booking[],
    date: string,
    allHours: number[]
  ): number[] => {
    const bookedHours = bookings
      .filter((b) => b.date === date)
      .map((b) => b.hour);
    return allHours.filter((hour) => !bookedHours.includes(hour));
  },
};
