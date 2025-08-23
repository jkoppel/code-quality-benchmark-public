import { useState, useCallback } from 'react';
import { HOURS, UI_MESSAGES } from '../constants';
import { getNextTimeSlot, getTimeSlotIndex } from '../utils/timeUtils';
import { isSlotBooked } from '../utils/slotUtils';
import { Booking } from '../types';

export const useCalendarState = () => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const resetState = useCallback(() => {
    setSelectedSlot(null);
    setSelectedEndSlot(null);
    setUserName('');
    setShowBookingForm(false);
  }, []);

  const handleSlotClick = useCallback((
    time: string,
    selectedRoom: string,
    selectedDate: string,
    bookings: Booking[],
    onUnbook: (bookingId: string) => void
  ) => {
    const booking = isSlotBooked(selectedRoom, time, selectedDate, bookings);
    
    if (booking) {
      const confirmMessage = `${UI_MESSAGES.CONFIRM_UNBOOK}\nBooked by: ${booking.userName}\nTime: ${booking.startTime} - ${booking.endTime}`;
      if (window.confirm(confirmMessage)) {
        onUnbook(booking.id);
      }
    } else {
      if (!selectedSlot) {
        setSelectedSlot(time);
        setSelectedEndSlot(null);
        setShowBookingForm(false);
      } else if (!selectedEndSlot) {
        const startIndex = getTimeSlotIndex(selectedSlot);
        const endIndex = getTimeSlotIndex(time);
        
        if (endIndex >= startIndex) {
          if (endIndex === startIndex) {
            // Same slot clicked - book just 30 minutes
            setShowBookingForm(true);
          } else {
            const hasConflict = HOURS.slice(startIndex, endIndex).some(t =>
              isSlotBooked(selectedRoom, t, selectedDate, bookings)
            );
            
            if (!hasConflict) {
              setSelectedEndSlot(time);
              setShowBookingForm(true);
            } else {
              alert(UI_MESSAGES.BOOKING_CONFLICT);
              resetState();
            }
          }
        } else {
          setSelectedSlot(time);
          setSelectedEndSlot(null);
        }
      } else {
        setSelectedSlot(time);
        setSelectedEndSlot(null);
        setShowBookingForm(false);
      }
    }
  }, [selectedSlot, selectedEndSlot, resetState]);

  const getEndTime = useCallback(() => {
    if (selectedEndSlot) {
      const endIndex = getTimeSlotIndex(selectedEndSlot);
      return HOURS[endIndex + 1] || '20:00';
    } else if (selectedSlot) {
      return getNextTimeSlot(selectedSlot);
    }
    return '20:00';
  }, [selectedSlot, selectedEndSlot]);

  return {
    selectedSlot,
    selectedEndSlot,
    userName,
    showBookingForm,
    setUserName,
    resetState,
    handleSlotClick,
    getEndTime
  };
};