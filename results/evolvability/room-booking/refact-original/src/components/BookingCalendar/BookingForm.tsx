import React from 'react';
import { formatHour } from '../../utils/dateUtils';

interface BookingFormProps {
  roomName: string;
  date: string;
  hour: number;
  name: string;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  roomName,
  date,
  hour,
  name,
  onNameChange,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="booking-form-overlay">
      <div className="booking-form">
        <h3>Book {roomName}</h3>
        <p>Date: {date}</p>
        <p>Time: {formatHour(hour)}</p>
        <input 
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <div className="form-buttons">
          <button onClick={onConfirm} disabled={!name.trim()}>
            Confirm Booking
          </button>
          <button onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
