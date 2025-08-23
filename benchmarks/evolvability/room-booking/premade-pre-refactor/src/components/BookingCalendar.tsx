import React, { useState } from 'react';
import { Room, Booking } from '../types';
import { HOURS } from '../constants';

interface BookingCalendarProps {
  room: Room;
  bookings: Booking[];
  onBook: (name: string, date: string, hour: number) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ room, bookings, onBook }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [bookingName, setBookingName] = useState('');

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
    if (bookingName && selectedHour !== null) {
      onBook(bookingName, selectedDate, selectedHour);
      setShowBookingForm(false);
      setBookingName('');
      setSelectedHour(null);
    }
  };

  const formatHour = (hour: number) => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`;
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
            <div 
              key={hour}
              className={`hour-slot ${booked ? 'booked' : 'available'}`}
              onClick={() => handleHourClick(hour)}
            >
              <div className="hour-time">{formatHour(hour)}</div>
              {booked && booking && (
                <div className="booking-info">Booked by: {booking.name}</div>
              )}
            </div>
          );
        })}
      </div>

      {showBookingForm && (
        <div className="booking-form-overlay">
          <div className="booking-form">
            <h3>Book {room.name}</h3>
            <p>Date: {selectedDate}</p>
            <p>Time: {selectedHour !== null && formatHour(selectedHour)}</p>
            <input 
              type="text"
              placeholder="Your name"
              value={bookingName}
              onChange={(e) => setBookingName(e.target.value)}
            />
            <div className="form-buttons">
              <button onClick={handleBooking}>Confirm Booking</button>
              <button onClick={() => {
                setShowBookingForm(false);
                setBookingName('');
                setSelectedHour(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;