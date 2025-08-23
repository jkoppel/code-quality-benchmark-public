import React, { useState } from 'react';
import { Booking } from '../types';
import { HOURS } from '../constants';
import { useSlotSelection } from '../hooks/useSlotSelection';
import { formatDisplayDate } from '../utils/dateUtils';
import { getTimeRange } from '../utils/timeUtils';
import DateNavigation from './DateNavigation';
import BookingForm from './BookingForm';
import TimeSlot from './TimeSlot';

interface BookingCalendarProps {
  selectedRoom: string | null;
  selectedDate: string;
  bookings: Booking[];
  onBook: (roomName: string, date: string, startTime: string, endTime: string, userName: string) => void;
  onUnbook: (bookingId: string) => void;
  onDateChange: (date: string) => void;
  findBookingAtSlot: (roomName: string, date: string, time: string) => Booking | undefined;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedRoom,
  selectedDate,
  bookings,
  onBook,
  onUnbook,
  onDateChange,
  findBookingAtSlot
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const {
    selectedSlot,
    selectedEndSlot,
    clearSelection,
    selectStartSlot,
    selectEndSlot,
    isSlotSelected,
    isSlotInRange,
    getEndTime,
    hasValidSelection
  } = useSlotSelection();

  const handleSlotClick = (time: string) => {
    const booking = findBookingAtSlot(selectedRoom!, selectedDate, time);
    
    if (booking) {
      if (window.confirm(`Unbook this slot?\nBooked by: ${booking.userName}\nTime: ${booking.startTime} - ${booking.endTime}`)) {
        onUnbook(booking.id);
      }
    } else {
      if (!selectedSlot) {
        selectStartSlot(time);
        setShowBookingForm(false);
      } else if (!selectedEndSlot) {
        const startIndex = HOURS.indexOf(selectedSlot);
        const endIndex = HOURS.indexOf(time);
        
        if (endIndex >= startIndex) {
          if (endIndex === startIndex) {
            // Same slot clicked - book just 30 minutes
            setShowBookingForm(true);
          } else {
            const timeRange = getTimeRange(selectedSlot, time);
            const hasConflict = timeRange.some(t =>
              findBookingAtSlot(selectedRoom!, selectedDate, t)
            );
            
            if (!hasConflict) {
              selectEndSlot(time);
              setShowBookingForm(true);
            } else {
              alert('Selected range contains booked slots');
              clearSelection();
            }
          }
        } else {
          selectStartSlot(time);
        }
      } else {
        selectStartSlot(time);
        setShowBookingForm(false);
      }
    }
  };

  const handleBookingConfirm = (userName: string) => {
    if (selectedSlot) {
      const endTime = getEndTime();
      onBook(selectedRoom!, selectedDate, selectedSlot, endTime, userName);
      clearSelection();
      setShowBookingForm(false);
    }
  };

  const handleBookingCancel = () => {
    clearSelection();
    setShowBookingForm(false);
  };

  if (!selectedRoom) {
    return <div className="calendar-container">Please select a room</div>;
  }

  return (
    <div className="calendar-container">
      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      <h3>{selectedRoom} - {formatDisplayDate(selectedDate)}</h3>
      
      <div className="time-slots">
        {HOURS.map((time) => {
          const booking = findBookingAtSlot(selectedRoom, selectedDate, time);
          
          return (
            <TimeSlot
              key={time}
              time={time}
              booking={booking}
              isSelected={isSlotSelected(time)}
              isInRange={isSlotInRange(time)}
              onClick={() => handleSlotClick(time)}
            />
          );
        })}
      </div>

      {showBookingForm && hasValidSelection() && (
        <BookingForm
          roomName={selectedRoom}
          startTime={selectedSlot!}
          endTime={getEndTime()}
          onConfirm={handleBookingConfirm}
          onCancel={handleBookingCancel}
        />
      )}

      {selectedSlot && !selectedEndSlot && !showBookingForm && (
        <p className="instruction">Click the same slot again for 30-min booking, or click another slot for longer duration</p>
      )}
    </div>
  );
};

export default BookingCalendar;