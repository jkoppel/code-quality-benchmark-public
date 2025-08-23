import React from 'react';
import { HOURS } from '../../constants';

interface BookingFormProps {
  selectedRoom: string;
  selectedSlot: string;
  selectedEndSlot: string | null;
  userName: string;
  onUserNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  selectedRoom,
  selectedSlot,
  selectedEndSlot,
  userName,
  onUserNameChange,
  onConfirm,
  onCancel
}) => {
  const getEndTime = () => {
    if (selectedEndSlot) {
      const endIndex = HOURS.indexOf(selectedEndSlot);
      return HOURS[endIndex + 1] || '20:00';
    } else {
      const startIndex = HOURS.indexOf(selectedSlot);
      return HOURS[startIndex + 1] || '20:00';
    }
  };

  return (
    <div className="booking-form">
      <h4>Book {selectedRoom}</h4>
      <p>From {selectedSlot} to {getEndTime()}</p>
      <input
        type="text"
        placeholder="Your name"
        value={userName}
        onChange={(e) => onUserNameChange(e.target.value)}
      />
      <button onClick={onConfirm} disabled={!userName.trim()}>
        Confirm Booking
      </button>
      <button onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
};

export default BookingForm;
