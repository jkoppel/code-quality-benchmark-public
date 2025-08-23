import React from 'react';
import { Booking } from '../../types';
import { BookingService } from '../../services/BookingService';

interface TimeSlotGridProps {
  roomName: string;
  selectedDate: string;
  timeSlots: string[];
  bookings: Booking[];
  selectedSlot: string | null;
  selectedEndSlot: string | null;
  onSlotClick: (time: string) => void;
  isInSelectedRange: (time: string) => boolean;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  roomName,
  selectedDate,
  timeSlots,
  bookings,
  selectedSlot,
  selectedEndSlot,
  onSlotClick,
  isInSelectedRange
}) => {
  return (
    <div className=\"time-slots\">
      {timeSlots.map((time) => {
        const booking = BookingService.isSlotBooked(roomName, time, selectedDate, bookings);
        const isSelected = time === selectedSlot;
        const isInRange = isInSelectedRange(time);
        
        return (
          <div
            key={time}
            className={`time-slot ${booking ? 'booked' : 'available'} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
            onClick={() => onSlotClick(time)}
          >
            <span className=\"time\">{time}</span>
            {booking && (
              <span className=\"booking-info\">{booking.userName}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};