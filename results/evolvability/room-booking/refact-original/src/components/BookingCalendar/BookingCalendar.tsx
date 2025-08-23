import React from 'react';
import { Booking } from '../../types';
import { HOURS, ROOMS } from '../../constants';
import { formatLongDate } from '../../utils/dateUtils';
import { useSlotSelection } from '../../hooks/useSlotSelection';
import DateNavigation from './DateNavigation';
import TimeSlot from './TimeSlot';
import BookingForm from './BookingForm';

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
  const {
    selectedSlot,
    selectedEndSlot,
    userName,
    showBookingForm,
    isInSelectedRange,
    getBookingAtTime,
    setUserName,
    handleSlotClick,
    handleBook,
    resetSelection
  } = useSlotSelection({
    selectedRoom,
    selectedDate,
    bookings,
    onBook,
    onUnbook
  });

  if (!selectedRoom) {
    return <div className="calendar-container">Please select a room</div>;
  }

  return (
    <div className="calendar-container">
      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      <h3>{selectedRoom} - {formatLongDate(selectedDate)}</h3>
      
      <div className="time-slots">
        {HOURS.map((time) => {
          const booking = getBookingAtTime(time);
          const isSelected = time === selectedSlot;
          const isInRange = isInSelectedRange(time);
          
          return (
            <TimeSlot
              key={time}
              time={time}
              booking={booking}
              isSelected={isSelected}
              isInRange={isInRange}
              onClick={handleSlotClick}
            />
          );
        })}
      </div>

      {showBookingForm && selectedSlot && (
        <BookingForm
          selectedRoom={selectedRoom}
          selectedSlot={selectedSlot}
          selectedEndSlot={selectedEndSlot}
          userName={userName}
          onUserNameChange={setUserName}
          onConfirm={handleBook}
          onCancel={resetSelection}
        />
      )}

      {selectedSlot && !selectedEndSlot && !showBookingForm && (
        <p className="instruction">
          Click the same slot again for 30-min booking, or click another slot for longer duration
        </p>
      )}
    </div>
  );
};

export default BookingCalendar;
