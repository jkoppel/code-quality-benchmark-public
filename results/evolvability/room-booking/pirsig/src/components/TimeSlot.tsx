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
  const getClassName = () => {
    const classes = ['time-slot'];
    
    if (booking) {
      classes.push('booked');
    } else {
      classes.push('available');
    }
    
    if (isSelected) {
      classes.push('selected');
    }
    
    if (isInRange) {
      classes.push('in-range');
    }
    
    return classes.join(' ');
  };
  
  return (
    <div
      className={getClassName()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      aria-label={`Time slot ${time}${booking ? `, booked by ${booking.userName}` : ', available'}`}
    >
      <span className="time">{time}</span>
      {booking && (
        <span className="booking-info">{booking.userName}</span>
      )}
    </div>
  );
};

export default TimeSlot;