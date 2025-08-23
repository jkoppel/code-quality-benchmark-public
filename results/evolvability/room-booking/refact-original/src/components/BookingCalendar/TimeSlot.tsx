import React from 'react';
import { Booking } from '../../types';

interface TimeSlotProps {
  time: string;
  booking?: Booking;
  isSelected: boolean;
  isInRange: boolean;
  onClick: (time: string) => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  booking,
  isSelected,
  isInRange,
  onClick
}) => {
  const handleClick = () => {
    onClick(time);
  };

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
      onClick={handleClick}
    >
      <span className="time">{time}</span>
      {booking && (
        <span className="booking-info">{booking.userName}</span>
      )}
    </div>
  );
};

export default TimeSlot;
