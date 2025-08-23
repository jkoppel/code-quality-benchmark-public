import React, { useEffect, useState } from 'react';
import { BookingCalendarProps } from './types';
import { useBookingState } from '../../hooks/useBookingState';
import { useBookingOperations } from '../../hooks/useBookingOperations';
import { HOURS } from '../../constants';
import DateSelector from './DateSelector';
import HoursGrid from './HoursGrid';
import BookingForm from './BookingForm';

/**
 * Enhanced BookingCalendar Component
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Orchestrates booking calendar functionality
 * - Open/Closed: Extensible through props and composition
 * - Liskov Substitution: Components can be substituted with compatible implementations
 * - Interface Segregation: Uses focused interfaces for different concerns
 * - Dependency Inversion: Depends on abstractions (hooks, utilities)
 * 
 * Design Patterns Used:
 * - Composition Pattern: Composed of smaller, focused components
 * - Strategy Pattern: Different booking strategies can be injected
 * - Observer Pattern: State changes trigger re-renders
 * - Factory Pattern: Uses service factory for booking operations
 */
const BookingCalendar: React.FC<BookingCalendarProps> = ({
  room,
  bookings,
  onBook,
  availableHours = HOURS,
  minDate,
  maxDate,
}) => {
  // State management using custom hooks
  const {
    selectedDate,
    showBookingForm,
    selectedHour,
    bookingName,
    setSelectedDate,
    setBookingName,
    openBookingForm,
    resetBookingForm,
  } = useBookingState();

  // Business logic using custom hooks
  const { isSlotAvailable, handleBooking } = useBookingOperations({
    bookings,
    onBook,
  });

  // Local state for form handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle hour slot click
  const handleHourClick = (hour: number) => {
    if (isSlotAvailable(selectedDate, hour)) {
      openBookingForm(hour);
      setFormError(null);
    }
  };

  // Handle booking confirmation
  const handleBookingConfirm = async () => {
    if (selectedHour === null) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = handleBooking(bookingName, selectedDate, selectedHour);
      
      if (result.success) {
        resetBookingForm();
      } else {
        setFormError(result.error || 'Failed to create booking');
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle booking cancellation
  const handleBookingCancel = () => {
    resetBookingForm();
    setFormError(null);
  };

  // Clear error when form inputs change
  useEffect(() => {
    if (formError && bookingName) {
      setFormError(null);
    }
  }, [bookingName, formError]);

  return (
    <div className=\"booking-calendar\" role=\"main\" aria-label={`Booking calendar for ${room.name}`}>
      {/* Header Section */}
      <header className=\"booking-calendar-header\">
        <h2 className=\"room-title\">{room.name}</h2>
        <p className=\"room-subtitle\">Select a date and available time slot to make a booking</p>
        {room.isVirtual && room.requiredRooms && (
          <div className=\"virtual-room-info\">
            <span className=\"virtual-badge\">Virtual Room</span>
            <span className=\"required-rooms\">
              Includes: {room.requiredRooms.join(', ')}
            </span>
          </div>
        )}
      </header>

      {/* Date Selection */}
      <section className=\"date-selection-section\" aria-label=\"Date selection\">
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      </section>

      {/* Hours Grid */}
      <section className=\"hours-section\" aria-label=\"Available time slots\">
        <HoursGrid
          room={room}
          selectedDate={selectedDate}
          bookings={bookings}
          hours={availableHours}
          onHourClick={handleHourClick}
        />
      </section>

      {/* Booking Form Modal */}
      <BookingForm
        isVisible={showBookingForm}
        room={room}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        bookingName={bookingName}
        onNameChange={setBookingName}
        onConfirm={handleBookingConfirm}
        onCancel={handleBookingCancel}
        isLoading={isSubmitting}
        error={formError}
      />

      {/* Accessibility Information */}
      <div className=\"sr-only\" aria-live=\"polite\">
        {showBookingForm && `Booking form opened for ${selectedHour !== null ? `${selectedHour}:00` : 'selected time'}`}
        {isSubmitting && 'Submitting booking...'}
        {formError && `Error: ${formError}`}
      </div>
    </div>
  );
};

export default BookingCalendar;