import { Room, Booking } from "../../types";

/**
 * Enhanced TypeScript interfaces for BookingCalendar components
 * Following Interface Segregation Principle
 */

// Base props that most components need
export interface BaseBookingProps {
  room: Room;
  selectedDate: string;
}

// Props for components that need booking data
export interface BookingDataProps extends BaseBookingProps {
  bookings: Booking[];
}

// Props for components that handle interactions
export interface BookingInteractionProps extends BookingDataProps {
  onHourClick: (hour: number) => void;
}

// Props for the date selector component
export interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

// Props for hour slot component
export interface HourSlotProps {
  hour: number;
  isBooked: boolean;
  booking?: Booking;
  onClick: (hour: number) => void;
  className?: string;
}

// Props for hours grid component
export interface HoursGridProps extends BookingInteractionProps {
  hours: number[];
}

// Props for booking form component
export interface BookingFormProps {
  isVisible: boolean;
  room: Room;
  selectedDate: string;
  selectedHour: number | null;
  bookingName: string;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

// Props for the main BookingCalendar component
export interface BookingCalendarProps {
  room: Room;
  bookings: Booking[];
  onBook: (name: string, date: string, hour: number) => void;
  availableHours?: number[];
  minDate?: string;
  maxDate?: string;
}

// State interface for booking form
export interface BookingFormState {
  name: string;
  isLoading: boolean;
  error?: string;
}

// Event handler types
export type HourClickHandler = (hour: number) => void;
export type DateChangeHandler = (date: string) => void;
export type BookingSubmitHandler = (
  name: string,
  date: string,
  hour: number
) => void;
