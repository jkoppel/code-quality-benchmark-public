import React, { useState } from 'react';
import { Room } from '../types';
import { HOURS } from '../constants/hours';
import { todayISO } from '../utils/dateUtils';
import { useBookings } from '../hooks/useBookings';
import HourSlot from './BookingCalendar/HourSlot';
import BookingForm from './BookingCalendar/BookingForm';

interface BookingCalendarProps {
  room: Room;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ room }) => {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [bookingName, setBookingName] = useState('');

  const { getForRoom, addBooking } = useBookings();
  const bookings = getForRoom(room.id);

  const isHourBooked = (hour: number) => {
    return bookings.some(
      booking => booking.date === selectedDate && booking.hour === hour
    );
  };

  const handleHourClick = (hour: number) => {
    if (!isHourBooked(hour)) {
      setSelectedHour(hour);
      setShowBookingForm(true);
    }
  };

  const handleBooking = () => {
    if (bookingName.trim() && selectedHour !== null) {
      addBooking(room, bookingName.trim(), selectedDate, selectedHour);
      setShowBookingForm(false);
      setBookingName('');
      setSelectedHour(null);
    }
  };

  const handleCancel = () => {
    setShowBookingForm(false);
    setBookingName('');
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
          const booked = isHourBooked(hour);
          const booking = bookings.find(
            b => b.date === selectedDate && b.hour === hour
          );
          
          return (
            <HourSlot
              key={hour}
              hour={hour}
              isBooked={booked}
              bookedBy={booking?.name}
              onClick={() => handleHourClick(hour)}
            />
          );
        })}
      </div>

      {showBookingForm && selectedHour !== null && (
        <BookingForm
          roomName={room.name}
          date={selectedDate}
          hour={selectedHour}
          name={bookingName}
          onNameChange={setBookingName}
          onConfirm={handleBooking}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default BookingCalendar;