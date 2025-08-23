/**
 * Booking System Configuration
 * Centralized configuration following Configuration Pattern
 */

export interface BookingConfig {
  // Time slot configuration
  availableHours: number[];
  timeSlotDuration: number; // in minutes

  // Booking constraints
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  maxBookingDuration: number; // in hours

  // UI configuration
  autoCloseFormDelay: number; // in milliseconds
  notificationAutoCloseDelay: number; // in milliseconds

  // Validation rules
  minNameLength: number;
  maxNameLength: number;

  // Business hours
  businessHoursStart: number; // 24-hour format
  businessHoursEnd: number; // 24-hour format

  // Features
  allowWeekendBookings: boolean;
  allowPastDateBookings: boolean;
  enableNotifications: boolean;
  enableErrorBoundary: boolean;
}

// Default configuration
export const defaultBookingConfig: BookingConfig = {
  // Standard business hours (9 AM to 6 PM)
  availableHours: Array.from({ length: 9 }, (_, i) => i + 9),
  timeSlotDuration: 60,

  // Booking constraints
  maxAdvanceBookingDays: 30,
  minAdvanceBookingHours: 1,
  maxBookingDuration: 4,

  // UI configuration
  autoCloseFormDelay: 3000,
  notificationAutoCloseDelay: 5000,

  // Validation rules
  minNameLength: 2,
  maxNameLength: 50,

  // Business hours
  businessHoursStart: 9,
  businessHoursEnd: 18,

  // Features
  allowWeekendBookings: false,
  allowPastDateBookings: false,
  enableNotifications: true,
  enableErrorBoundary: true,
};

// Extended hours configuration (24/7)
export const extendedHoursConfig: Partial<BookingConfig> = {
  availableHours: Array.from({ length: 24 }, (_, i) => i),
  businessHoursStart: 0,
  businessHoursEnd: 23,
  allowWeekendBookings: true,
};

// Conference room specific configuration
export const conferenceRoomConfig: Partial<BookingConfig> = {
  availableHours: Array.from({ length: 12 }, (_, i) => i + 8), // 8 AM to 8 PM
  maxBookingDuration: 8,
  minAdvanceBookingHours: 2,
  businessHoursStart: 8,
  businessHoursEnd: 20,
};

/**
 * Configuration factory
 * Allows for easy configuration switching
 */
export class BookingConfigFactory {
  static createConfig(
    baseConfig: BookingConfig = defaultBookingConfig,
    overrides: Partial<BookingConfig> = {}
  ): BookingConfig {
    return {
      ...baseConfig,
      ...overrides,
    };
  }

  static getBusinessHoursConfig(): BookingConfig {
    return this.createConfig(defaultBookingConfig);
  }

  static getExtendedHoursConfig(): BookingConfig {
    return this.createConfig(defaultBookingConfig, extendedHoursConfig);
  }

  static getConferenceRoomConfig(): BookingConfig {
    return this.createConfig(defaultBookingConfig, conferenceRoomConfig);
  }
}
