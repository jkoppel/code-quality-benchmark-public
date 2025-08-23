import React from 'react';
import { HOURS } from '../constants';
import { useBookingContext } from '../contexts/BookingContext';
import { useRoomContext } from '../contexts/RoomContext';
import { useTimeSlotSelection } from '../hooks/useTimeSlotSelection';
import { DateUtils } from '../utils/dateUtils';
import DateNavigation from './DateNavigation';
import TimeSlot from './TimeSlot';
import BookingForm from './BookingForm';

const BookingCalendar: React.FC = () => {
  const { selectedRoom } = useRoomContext();
  const {
    bookings,
    selectedDate,
    setSelectedDate,
    addBooking,
    removeBooking,
    getBookingForSlot,
    validateBooking
  } = useBookingContext();
  
  const {
    selectedStartSlot,
    selectedEndSlot,
    showBookingForm,
    selectTimeSlot,
    resetSelection,
    isInSelectedRange,
    getSelectedDuration
  } = useTimeSlotSelection();

  const handleSlotClick = (time: string) => {
    if (!selectedRoom) return;
    
    const booking = getBookingForSlot(selectedRoom, time);
    
    if (booking) {
      // Handle unbooking
      if (window.confirm(
        `Unbook this slot?\nBooked by: ${booking.userName}\nTime: ${booking.startTime} - ${booking.endTime}`
      )) {
        removeBooking(booking.id);
      }
    } else {
      // Handle selection for booking
      selectTimeSlot(time);
      
      // Validate the selection if we have a range
      if (selectedStartSlot && !selectedEndSlot) {
        const duration = getSelectedDuration();
        if (duration) {
          const validation = validateBooking(
            selectedRoom,
            selectedDate,
            duration.start,
            duration.end
          );
          
          if (!validation.valid) {
            alert(validation.message || 'Cannot book this time range');
            resetSelection();
          }
        }
      }
    }
  };

  const handleBookingConfirm = (userName: string) => {
    if (!selectedRoom || !selectedStartSlot) return;
    
    const duration = getSelectedDuration();
    if (!duration) return;
    
    const success = addBooking(
      selectedRoom,
      selectedDate,
      duration.start,
      duration.end,
      userName
    );
    
    if (success) {
      resetSelection();
    }
  };

  if (!selectedRoom) {
    return (
      <div className="calendar-container">
        <div className="no-room-selected">
          <p>Please select a room to view availability</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <h3>
        {selectedRoom} - {DateUtils.formatDateForDisplay(selectedDate)}
      </h3>
      
      <div className="time-slots">
        {HOURS.map((time) => {
          const booking = getBookingForSlot(selectedRoom, time);
          const isSelected = time === selectedStartSlot;
          const isInRange = isInSelectedRange(time);
          
          return (
            <TimeSlot
              key={time}
              time={time}
              booking={booking}
              isSelected={isSelected}
              isInRange={isInRange}
              onClick={() => handleSlotClick(time)}
            />
          );
        })}
      </div>

      {showBookingForm && selectedStartSlot && (
        <BookingForm
          roomName={selectedRoom}
          startTime={selectedStartSlot}
          endTime={getSelectedDuration()?.end || ''}
          onConfirm={handleBookingConfirm}
          onCancel={resetSelection}
        />
      )}

      {selectedStartSlot && !selectedEndSlot && !showBookingForm && (
        <p className="instruction">
          Click the same slot again for 30-min booking, or click another slot for longer duration
        </p>
      )}
    </div>
  );
};

export default BookingCalendar;