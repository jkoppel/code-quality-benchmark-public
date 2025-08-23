import React from 'react';
import { Booking } from '../../types';
import { formatHour } from '../../utils/dateUtils';

interface HourSlotProps {
  hour: number;
  isBooked: boolean;
  booking?: Booking;
  onClick: (hour: number) => void;
}

const HourSlot: React.FC<HourSlotProps> = ({ hour, isBooked, booking, onClick }) => {
  return (
    <div 
      className={`hour-slot ${isBooked ? 'booked' : 'available'}`}
      onClick={() => onClick(hour)}
    >
      <div className="hour-time">{formatHour(hour)}</div>
      {isBooked && booking && (
        <div className="booking-info">Booked by: {booking.name}</div>
      )}
    </div>
  );
};

export default HourSlot;