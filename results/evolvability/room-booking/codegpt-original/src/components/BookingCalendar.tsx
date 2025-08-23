import React, { useCallback, useState } from 'react';
import { Booking } from '../types';
import { BookingFormData } from '../types/booking';
import { HOURS } from '../constants';
import { useTimeSlotSelection } from '../hooks/useTimeSlotSelection';
import { BookingService } from '../services/BookingService';
import { DateNavigation } from './booking/DateNavigation';
import { TimeSlotGrid } from './booking/TimeSlotGrid';
import { BookingForm } from './booking/BookingForm';
import { DateUtils } from '../utils/dateUtils';

interface BookingCalendarProps {
  selectedRoom: string | null;
  selectedDate: string;
  bookings: Booking[];
  onBook: (roomName: string, date: string, startTime: string, endTime: string, userName: string) => void;
  onUnbook: (bookingId: string) => void;
  onDateChange: (date: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedRoom,
  selectedDate,
  bookings,
  onBook,
  onUnbook,
  onDateChange
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const {
    selectedSlot,
    selectedEndSlot,
    showBookingForm,
    handleSlotClick,
    resetSelection,
    isInSelectedRange
  } = useTimeSlotSelection();



  const handleTimeSlotClick = useCallback((time: string) => {
    if (!selectedRoom) return;
    
    setError(null);
    
    const result = handleSlotClick(time, selectedRoom, selectedDate, bookings, HOURS);
    
    if (typeof result === 'object') {
      switch (result.action) {
        case 'unbook':
          if (result.booking && window.confirm(
            `Unbook this slot?\nBooked by: ${result.booking.userName}\nTime: ${result.booking.startTime} - ${result.booking.endTime}`
          )) {
            onUnbook(result.booking.id);
          }
          break;
        case 'conflict':
          setError('Selected range contains booked slots');
          break;
      }
    }
  }, [selectedRoom, selectedDate, bookings, handleSlotClick, onUnbook]);

  const handleBookingConfirm = useCallback((formData: BookingFormData) => {
    if (!selectedRoom || !selectedSlot) return;
    
    let actualEndTime: string;
    
    if (selectedEndSlot) {
      const endIndex = HOURS.indexOf(selectedEndSlot);
      actualEndTime = HOURS[endIndex + 1] || '20:00';
    } else {
      // If no end slot selected, book just 30 minutes
      const startIndex = HOURS.indexOf(selectedSlot);
      actualEndTime = HOURS[startIndex + 1] || '20:00';
    }
    
    try {
      onBook(selectedRoom, selectedDate, selectedSlot, actualEndTime, formData.userName);
      resetSelection();
      setError(null);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    }
  }, [selectedRoom, selectedDate, selectedSlot, selectedEndSlot, onBook, resetSelection]);

  const handleBookingCancel = useCallback(() => {
    resetSelection();
    setError(null);
  }, [resetSelection]);

  const getEndTime = useCallback((): string => {
    if (!selectedSlot) return '';
    
    if (selectedEndSlot) {
      const endIndex = HOURS.indexOf(selectedEndSlot);
      return HOURS[endIndex + 1] || '20:00';
    } else {
      const startIndex = HOURS.indexOf(selectedSlot);
      return HOURS[startIndex + 1] || '20:00';
    }
  }, [selectedSlot, selectedEndSlot]);

  if (!selectedRoom) {
    return (
      <div className="calendar-container">
        <div className="empty-state">
          Please select a room to view the booking calendar
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <DateNavigation 
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      <div className="calendar-header">
        <h3>
          {selectedRoom} - {DateUtils.formatDateForDisplay(selectedDate)}
        </h3>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
      
      <TimeSlotGrid
        roomName={selectedRoom}
        selectedDate={selectedDate}
        timeSlots={HOURS}
        bookings={bookings}
        selectedSlot={selectedSlot}
        selectedEndSlot={selectedEndSlot}
        onSlotClick={handleTimeSlotClick}
        isInSelectedRange={(time) => isInSelectedRange(time, HOURS)}
      />

      {showBookingForm && selectedSlot && (
        <BookingForm
          roomName={selectedRoom}
          startTime={selectedSlot}
          endTime={getEndTime()}
          onConfirm={handleBookingConfirm}
          onCancel={handleBookingCancel}
        />
      )}

      {selectedSlot && !selectedEndSlot && !showBookingForm && (
        <div className="instruction">
          Click the same slot again for 30-min booking, or click another slot for longer duration
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;