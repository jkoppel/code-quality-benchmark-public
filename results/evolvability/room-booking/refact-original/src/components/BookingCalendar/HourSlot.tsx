import React from 'react';
import { formatHour } from '../../utils/dateUtils';

interface HourSlotProps {
  hour: number;
  isBooked: boolean;
  bookedBy?: string;
  onClick: () => void;
}

const HourSlot: React.FC<HourSlotProps> = ({
  hour,
  isBooked,
  bookedBy,
  onClick
}) => {
  return (
    <div 
      className={`hour-slot ${isBooked ? 'booked' : 'available'}`}
      onClick={onClick}
    >
      <div className="hour-time">{formatHour(hour)}</div>
      {isBooked && bookedBy && (
        <div className="booking-info">Booked by: {bookedBy}</div>
      )}
    </div>
  );
};

export default HourSlot;
