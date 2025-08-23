// Import and re-export base types
import type { Booking, Room, TimeSlot } from '../types';
export type { Booking, Room, TimeSlot };

// Additional type definitions for improved type safety
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface BookingFormData {
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
}

export interface CalendarState {
  selectedDate: string;
  selectedRoom: string | null;
}

export interface BookingFilters {
  roomName?: string;
  date?: string;
  userName?: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export interface ExtendedBooking extends Booking {
  status?: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}