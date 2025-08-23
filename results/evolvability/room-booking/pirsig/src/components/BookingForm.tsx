import React, { useState } from 'react';
import { TimeUtils } from '../utils/timeUtils';

interface BookingFormProps {
  roomName: string;
  startTime: string;
  endTime: string;
  onConfirm: (userName: string) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  roomName,
  startTime,
  endTime,
  onConfirm,
  onCancel
}) => {
  const [userName, setUserName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      onConfirm(userName.trim());
    }
  };
  
  const duration = TimeUtils.formatDuration(startTime, endTime);
  
  return (
    <div className="booking-form">
      <h4>Book {roomName}</h4>
      <p>From {startTime} to {endTime} ({duration})</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          autoFocus
          required
        />
        <div className="form-actions">
          <button type="submit" disabled={!userName.trim()}>
            Confirm Booking
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;