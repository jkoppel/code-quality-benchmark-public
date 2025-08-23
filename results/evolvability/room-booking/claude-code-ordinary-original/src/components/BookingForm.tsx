import React, { useState } from 'react';

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
      setUserName('');
    }
  };

  return (
    <div className="booking-form">
      <h4>Book {roomName}</h4>
      <p>From {startTime} to {endTime}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <div className="form-buttons">
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