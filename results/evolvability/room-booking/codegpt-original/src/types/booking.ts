export interface BookingFormData {
  userName: string;
}

export interface BookingCreationData {
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
}

export interface SlotClickResult {
  action: "select" | "unbook" | "conflict";
  booking?: import("../types").Booking;
  conflictingSlots?: string[];
}

export interface BookingCalendarState {
  selectedRoom: string | null;
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
}

export interface TimeSlotDisplayProps {
  time: string;
  isBooked: boolean;
  isSelected: boolean;
  isInRange: boolean;
  booking?: import("../types").Booking;
  onClick: () => void;
}

export interface BookingOperations {
  createBooking: (data: BookingCreationData) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  validateBooking: (data: BookingCreationData) => Promise<boolean>;
}
