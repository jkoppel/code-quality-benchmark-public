import React, { useState } from 'react';
import { Room, Booking } from '../types';
import { HOURS } from '../constants/hours';
import { BookingService } from '../services/bookingService';
import { getCurrentDate } from '../utils/dateUtils';
import HourSlot from './BookingCalendar/HourSlot';
import BookingForm from './BookingCalendar/BookingForm';

interface BookingCalendarProps {
  room: Room;
  bookings: Booking[];
  onBook: (name: string, date: string, hour: number) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ room, bookings, onBook }) => {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const handleHourClick = (hour: number) => {
    if (BookingService.isHourAvailable(bookings, selectedDate, hour)) {
      setSelectedHour(hour);
      setShowBookingForm(true);
    }
  };

  const handleBookingConfirm = (name: string) => {
    if (selectedHour !== null) {
      onBook(name, selectedDate, selectedHour);
      setShowBookingForm(false);
      setSelectedHour(null);
    }
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
    setSelectedHour(null);
  };

  return (
    <div className="booking-calendar">
      <h2>{room.name} - Availability</h2>
      
      <div className="date-selector">
        <label>Date: </label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="hours-grid">
        {HOURS.map(hour => {
          const isBooked = !BookingService.isHourAvailable(bookings, selectedDate, hour);
          const booking = BookingService.getBookingForSlot(bookings, selectedDate, hour);
          
          return (
            <HourSlot
              key={hour}
              hour={hour}
              isBooked={isBooked}
              booking={booking}
              onClick={handleHourClick}
            />
          );
        })}
      </div>

      {showBookingForm && selectedHour !== null && (
        <BookingForm
          room={room}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
          onConfirm={handleBookingConfirm}
          onCancel={handleBookingCancel}
        />
      )}
    </div>
  );
};

export default BookingCalendar;