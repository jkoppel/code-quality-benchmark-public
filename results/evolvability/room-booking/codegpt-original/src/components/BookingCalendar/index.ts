/**
 * BookingCalendar Module Exports
 * Provides a clean public API following the Facade Pattern
 */

// Main component
export { default as BookingCalendar } from "./BookingCalendar";

// Sub-components (for advanced usage)
export { default as DateSelector } from "./DateSelector";
export { default as HourSlot } from "./HourSlot";
export { default as HoursGrid } from "./HoursGrid";
export { default as BookingForm } from "./BookingForm";

// Types (for TypeScript consumers)
export type {
  BookingCalendarProps,
  DateSelectorProps,
  HourSlotProps,
  HoursGridProps,
  BookingFormProps,
  BaseBookingProps,
  BookingDataProps,
  BookingInteractionProps,
  HourClickHandler,
  DateChangeHandler,
  BookingSubmitHandler,
} from "./types";

// Default export
export { BookingCalendar as default } from "./BookingCalendar";
