export interface Booking {
  id: string;
  roomName: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  userName: string;
}

export interface Room {
  name: string;
  isVirtual?: boolean;
  components?: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booking?: Booking;
}

// New types for better type safety
export type DateString = string; // YYYY-MM-DD format
export type TimeString = string; // HH:MM format

export interface BookingRequest {
  roomName: string;
  date: DateString;
  startTime: TimeString;
  endTime: TimeString;
  userName: string;
}

export interface SlotSelectionState {
  selectedSlot: TimeString | null;
  selectedEndSlot: TimeString | null;
}