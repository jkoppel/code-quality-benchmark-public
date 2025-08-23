export interface Booking {
  id: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
  resources?: string[];
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

// Hook return types
export interface UseBookingsReturn {
  bookings: Booking[];
  addBooking: (roomName: string, date: string, startTime: string, endTime: string, userName: string, resources?: string[]) => void;
  removeBookingById: (bookingId: string) => void;
}

// Component prop interfaces
export interface DateNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export interface TimeSlotsProps {
  selectedRoom: string;
  selectedDate: string;
  bookings: Booking[];
  selectedSlot: string | null;
  selectedEndSlot: string | null;
  onSlotClick: (time: string) => void;
}

export interface BookingFormProps {
  roomName: string;
  startTime: string;
  endTime: string;
  userName: string;
  selectedResources: string[];
  onUserNameChange: (name: string) => void;
  onResourcesChange: (resources: string[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

// Utility types
export type RoomName = string;
export type TimeString = string;
export type DateString = string;
export type BookingId = string;