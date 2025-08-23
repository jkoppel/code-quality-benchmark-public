import React from 'react';
import { TimeSlotsProps } from '../types';
import { HOURS } from '../constants';
import { isSlotBooked } from '../utils/slotUtils';

const TimeSlots: React.FC<TimeSlotsProps> = ({
  selectedRoom,
  selectedDate,
  bookings,
  selectedSlot,
  selectedEndSlot,
  onSlotClick
}) => {
  const isInSelectedRange = (time: string): boolean => {
    if (!selectedSlot || !selectedEndSlot) return false;
    const startIndex = HOURS.indexOf(selectedSlot);
    const endIndex = HOURS.indexOf(selectedEndSlot);
    const currentIndex = HOURS.indexOf(time);
    return currentIndex >= startIndex && currentIndex <= endIndex;
  };

  return (
    <div className="time-slots">
      {HOURS.map((time) => {
        const booking = isSlotBooked(selectedRoom, time, selectedDate, bookings);
        const isSelected = time === selectedSlot;
        const isInRange = isInSelectedRange(time);
        
        return (
          <div
            key={time}
            className={`time-slot ${booking ? 'booked' : 'available'} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
            onClick={() => onSlotClick(time)}
          >
            <span className="time">{time}</span>
            {booking && (
              <div className="booking-info">
                <div>{booking.userName}</div>
                {booking.resources && booking.resources.length > 0 && (
                  <div className="resources-info">
                    {booking.resources.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TimeSlots;