/**
 * Application-wide configuration constants
 */

export const APP_CONFIG = {
  // Time slot configuration
  TIME_SLOT_DURATION_MINUTES: 30,
  DEFAULT_BOOKING_DURATION_MINUTES: 30,
  MIN_BOOKING_DURATION_MINUTES: 30,
  MAX_BOOKING_DURATION_HOURS: 8,
  
  // Business hours
  BUSINESS_START_TIME: '08:00',
  BUSINESS_END_TIME: '20:00',
  
  // UI Configuration
  MAX_ADVANCE_BOOKING_DAYS: 90,
  MIN_ADVANCE_BOOKING_HOURS: 0,
  
  // Validation
  MAX_USER_NAME_LENGTH: 100,
  MIN_USER_NAME_LENGTH: 1,
  
  // Display
  DATE_FORMAT: 'en-US',
  TIME_FORMAT_24H: true,
} as const;

export const MESSAGES = {
  ERRORS: {
    INVALID_TIME_SELECTION: 'Invalid time selection',
    END_TIME_BEFORE_START: 'End time must be after start time',
    SLOT_ALREADY_BOOKED: 'This time slot is already booked',
    BOOKING_CONFLICT: 'Selected range contains booked slots',
    ROOM_NOT_FOUND: 'Room not found',
    BOOKING_NOT_FOUND: 'Booking not found',
    INVALID_DATE: 'Invalid date selected',
    INVALID_USER_NAME: 'Please enter a valid name',
  },
  CONFIRMATIONS: {
    BOOKING_SUCCESS: 'Room booked successfully',
    BOOKING_CANCELLED: 'Booking cancelled successfully',
    UNBOOK_CONFIRM: 'Are you sure you want to cancel this booking?',
  },
  INFO: {
    SELECT_ROOM: 'Please select a room to view availability',
    SELECT_TIME_SLOT: 'Click a time slot to start booking',
    BOOKING_INSTRUCTIONS: 'Click the same slot again for 30-min booking, or click another slot for longer duration',
  }
} as const;