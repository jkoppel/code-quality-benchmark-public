import React, { useState } from 'react';
import { Room } from '../../types';
import { formatHour } from '../../utils/dateUtils';

interface BookingFormProps {
  room: Room;
  selectedDate: string;
  selectedHour: number;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  room,
  selectedDate,
  selectedHour,
  onConfirm,
  onCancel,
}) => {
  const [bookingName, setBookingName] = useState('');

  const handleConfirm = () => {
    if (bookingName.trim()) {
      onConfirm(bookingName);
      setBookingName('');
    }
  };

  const handleCancel = () => {
    setBookingName('');
    onCancel();
  };

  return (
    <div className="booking-form-overlay">
      <div className="booking-form">
        <h3>Book {room.name}</h3>
        <p>Date: {selectedDate}</p>
        <p>Time: {formatHour(selectedHour)}</p>
        <input 
          type="text"
          placeholder="Your name"
          value={bookingName}
          onChange={(e) => setBookingName(e.target.value)}
        />
        <div className="form-buttons">
          <button onClick={handleConfirm}>Confirm Booking</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;