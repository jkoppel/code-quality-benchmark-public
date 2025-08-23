import React from 'react';
import { Booking } from '../types';

interface TimeSlotProps {
  time: string;
  booking?: Booking;
  isSelected: boolean;
  isInRange: boolean;
  onClick: () => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  booking,
  isSelected,
  isInRange,
  onClick
}) => {
  const getSlotClassName = (): string => {
    const baseClass = 'time-slot';
    const statusClass = booking ? 'booked' : 'available';
    const selectedClass = isSelected ? 'selected' : '';
    const rangeClass = isInRange ? 'in-range' : '';
    
    return [baseClass, statusClass, selectedClass, rangeClass]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div
      className={getSlotClassName()}
      onClick={onClick}
    >
      <span className="time">{time}</span>
      {booking && (
        <span className="booking-info">{booking.userName}</span>
      )}
    </div>
  );
};

export default TimeSlot;