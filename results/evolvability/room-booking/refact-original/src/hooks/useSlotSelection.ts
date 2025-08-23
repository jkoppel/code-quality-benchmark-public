import { useState, useCallback } from 'react';
import { Booking } from '../types';
import { ROOMS, HOURS } from '../constants';
import { findBookingAtTime, hasTimeRangeConflict } from '../services/bookingService';

interface UseSlotSelectionParams {
  selectedRoom: string | null;
  selectedDate: string;
  bookings: Booking[];
  onBook: (roomName: string, date: string, startTime: string, endTime: string, userName: string) => void;
  onUnbook: (bookingId: string) => void;
}

/**
 * Hook to manage slot selection state and booking form interactions
 */
export function useSlotSelection({
  selectedRoom,
  selectedDate,
  bookings,
  onBook,
  onUnbook
}: UseSlotSelectionParams) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const getBookingAtTime = useCallback((time: string): Booking | undefined => {
    if (!selectedRoom) return undefined;
    const room = ROOMS.find(r => r.name === selectedRoom);
    if (!room) return undefined;
    return findBookingAtTime(bookings, room, selectedDate, time);
  }, [bookings, selectedDate, selectedRoom]);

  const isInSelectedRange = useCallback((time: string): boolean => {
    if (!selectedSlot || !selectedEndSlot) return false;
    const startIndex = HOURS.indexOf(selectedSlot);
    const endIndex = HOURS.indexOf(selectedEndSlot);
    const currentIndex = HOURS.indexOf(time);
    return currentIndex >= startIndex && currentIndex <= endIndex;
  }, [selectedSlot, selectedEndSlot]);

  const handleSlotClick = useCallback((time: string) => {
    if (!selectedRoom) return;
    
    const booking = getBookingAtTime(time);
    
    // If slot is booked, handle unbooking
    if (booking) {
      if (window.confirm(`Unbook this slot?\nBooked by: ${booking.userName}\nTime: ${booking.startTime} - ${booking.endTime}`)) {
        onUnbook(booking.id);
      }
      return;
    }

    // Handle slot selection for booking
    if (!selectedSlot) {
      // First slot selection
      setSelectedSlot(time);
      setSelectedEndSlot(null);
      setShowBookingForm(false);
    } else if (!selectedEndSlot) {
      // Second slot selection
      const startIndex = HOURS.indexOf(selectedSlot);
      const endIndex = HOURS.indexOf(time);
      
      if (endIndex >= startIndex) {
        if (endIndex === startIndex) {
          // Same slot clicked - book just 30 minutes
          setShowBookingForm(true);
        } else {
          // Check for conflicts in the range
          const room = ROOMS.find(r => r.name === selectedRoom);
          if (room && !hasTimeRangeConflict(bookings, room, selectedDate, selectedSlot, time, HOURS)) {
            setSelectedEndSlot(time);
            setShowBookingForm(true);
          } else {
            alert('Selected range contains booked slots');
            setSelectedSlot(null);
            setSelectedEndSlot(null);
          }
        }
      } else {
        // End time is before start time, reset to new start
        setSelectedSlot(time);
        setSelectedEndSlot(null);
      }
    } else {
      // Third click - restart selection
      setSelectedSlot(time);
      setSelectedEndSlot(null);
      setShowBookingForm(false);
    }
  }, [selectedRoom, selectedSlot, selectedEndSlot, getBookingAtTime, bookings, selectedDate, onUnbook]);

  const handleBook = useCallback(() => {
    if (selectedSlot && userName.trim() && selectedRoom) {
      let actualEndTime: string;
      
      if (selectedEndSlot) {
        const endIndex = HOURS.indexOf(selectedEndSlot);
        actualEndTime = HOURS[endIndex + 1] || '20:00';
      } else {
        // If no end slot selected, book just 30 minutes
        const startIndex = HOURS.indexOf(selectedSlot);
        actualEndTime = HOURS[startIndex + 1] || '20:00';
      }
      
      onBook(selectedRoom, selectedDate, selectedSlot, actualEndTime, userName.trim());
      
      // Reset state
      setSelectedSlot(null);
      setSelectedEndSlot(null);
      setUserName('');
      setShowBookingForm(false);
    }
  }, [selectedSlot, selectedEndSlot, userName, selectedRoom, selectedDate, onBook]);

  const resetSelection = useCallback(() => {
    setSelectedSlot(null);
    setSelectedEndSlot(null);
    setUserName('');
    setShowBookingForm(false);
  }, []);

  return {
    selectedSlot,
    selectedEndSlot,
    userName,
    showBookingForm,
    isInSelectedRange,
    getBookingAtTime,
    setUserName,
    handleSlotClick,
    handleBook,
    resetSelection
  };
}
