import React, { useState } from 'react';
import { Booking } from '../types';
import { HOURS, ROOMS } from '../constants';

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
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const isSlotBooked = (roomName: string, time: string): Booking | undefined => {
    const room = ROOMS.find(r => r.name === roomName);
    
    if (room?.isVirtual && room.components) {
      const componentBooking = room.components.some(component =>
        bookings.some(b =>
          b.roomName === component &&
          b.date === selectedDate &&
          b.startTime <= time &&
          b.endTime > time
        )
      );
      if (componentBooking) {
        return bookings.find(b =>
          room.components!.includes(b.roomName) &&
          b.date === selectedDate &&
          b.startTime <= time &&
          b.endTime > time
        );
      }
    }

    if (!room?.isVirtual) {
      const grandBallroomBooking = bookings.find(b =>
        b.roomName === 'Grand Ballroom' &&
        b.date === selectedDate &&
        b.startTime <= time &&
        b.endTime > time &&
        (roomName === 'Ballroom 1' || roomName === 'Ballroom 2' || roomName === 'Ballroom 3')
      );
      if (grandBallroomBooking) return grandBallroomBooking;
    }

    return bookings.find(b =>
      b.roomName === roomName &&
      b.date === selectedDate &&
      b.startTime <= time &&
      b.endTime > time
    );
  };

  const handleSlotClick = (time: string) => {
    const booking = isSlotBooked(selectedRoom!, time);
    
    if (booking) {
      if (window.confirm(`Unbook this slot?\nBooked by: ${booking.userName}\nTime: ${booking.startTime} - ${booking.endTime}`)) {
        onUnbook(booking.id);
      }
    } else {
      if (!selectedSlot) {
        setSelectedSlot(time);
        setSelectedEndSlot(null);
        setShowBookingForm(false);
      } else if (!selectedEndSlot) {
        const startIndex = HOURS.indexOf(selectedSlot);
        const endIndex = HOURS.indexOf(time);
        
        if (endIndex >= startIndex) {
          if (endIndex === startIndex) {
            // Same slot clicked - book just 30 minutes
            setShowBookingForm(true);
          } else {
            const hasConflict = HOURS.slice(startIndex, endIndex).some(t =>
              isSlotBooked(selectedRoom!, t)
            );
            
            if (!hasConflict) {
              setSelectedEndSlot(time);
              setShowBookingForm(true);
            } else {
              alert('Selected range contains booked slots');
              setSelectedSlot(null);
              setSelectedEndSlot(null);
            }
          }
        } else {
          setSelectedSlot(time);
          setSelectedEndSlot(null);
        }
      } else {
        setSelectedSlot(time);
        setSelectedEndSlot(null);
        setShowBookingForm(false);
      }
    }
  };

  const handleBook = () => {
    if (selectedSlot && userName.trim()) {
      let actualEndTime: string;
      
      if (selectedEndSlot) {
        const endIndex = HOURS.indexOf(selectedEndSlot);
        actualEndTime = HOURS[endIndex + 1] || '20:00';
      } else {
        // If no end slot selected, book just 30 minutes
        const startIndex = HOURS.indexOf(selectedSlot);
        actualEndTime = HOURS[startIndex + 1] || '20:00';
      }
      
      onBook(selectedRoom!, selectedDate, selectedSlot, actualEndTime, userName.trim());
      setSelectedSlot(null);
      setSelectedEndSlot(null);
      setUserName('');
      setShowBookingForm(false);
    }
  };

  const isInSelectedRange = (time: string): boolean => {
    if (!selectedSlot || !selectedEndSlot) return false;
    const startIndex = HOURS.indexOf(selectedSlot);
    const endIndex = HOURS.indexOf(selectedEndSlot);
    const currentIndex = HOURS.indexOf(time);
    return currentIndex >= startIndex && currentIndex <= endIndex;
  };

  if (!selectedRoom) {
    return <div className="calendar-container">Please select a room</div>;
  }

  return (
    <div className="calendar-container">
      <div className="date-navigation">
        <button onClick={() => {
          const date = new Date(selectedDate);
          date.setDate(date.getDate() - 1);
          onDateChange(date.toISOString().split('T')[0]);
        }}>← Previous Day</button>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
        
        <button onClick={() => {
          const date = new Date(selectedDate);
          date.setDate(date.getDate() + 1);
          onDateChange(date.toISOString().split('T')[0]);
        }}>Next Day →</button>
      </div>

      <h3>{selectedRoom} - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
      
      <div className="time-slots">
        {HOURS.map((time) => {
          const booking = isSlotBooked(selectedRoom, time);
          const isSelected = time === selectedSlot;
          const isInRange = isInSelectedRange(time);
          
          return (
            <div
              key={time}
              className={`time-slot ${booking ? 'booked' : 'available'} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
              onClick={() => handleSlotClick(time)}
            >
              <span className="time">{time}</span>
              {booking && (
                <span className="booking-info">{booking.userName}</span>
              )}
            </div>
          );
        })}
      </div>

      {showBookingForm && selectedSlot && (
        <div className="booking-form">
          <h4>Book {selectedRoom}</h4>
          <p>From {selectedSlot} to {selectedEndSlot ? (HOURS[HOURS.indexOf(selectedEndSlot) + 1] || '20:00') : (HOURS[HOURS.indexOf(selectedSlot) + 1] || '20:00')}</p>
          <input
            type="text"
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={handleBook} disabled={!userName.trim()}>Confirm Booking</button>
          <button onClick={() => {
            setSelectedSlot(null);
            setSelectedEndSlot(null);
            setShowBookingForm(false);
          }}>Cancel</button>
        </div>
      )}

      {selectedSlot && !selectedEndSlot && !showBookingForm && (
        <p className="instruction">Click the same slot again for 30-min booking, or click another slot for longer duration</p>
      )}
    </div>
  );
};

export default BookingCalendar;