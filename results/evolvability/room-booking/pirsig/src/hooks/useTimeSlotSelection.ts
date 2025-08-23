import { useState, useCallback } from 'react';
import { HOURS } from '../constants';

export interface TimeSlotSelectionState {
  selectedStartSlot: string | null;
  selectedEndSlot: string | null;
  showBookingForm: boolean;
}

export interface TimeSlotSelectionActions {
  selectTimeSlot: (time: string) => void;
  resetSelection: () => void;
  confirmSelection: () => void;
  isInSelectedRange: (time: string) => boolean;
  getSelectedDuration: () => { start: string; end: string } | null;
}

export function useTimeSlotSelection(): TimeSlotSelectionState & TimeSlotSelectionActions {
  const [selectedStartSlot, setSelectedStartSlot] = useState<string | null>(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const selectTimeSlot = useCallback((time: string) => {
    if (!selectedStartSlot) {
      // First selection - start slot
      setSelectedStartSlot(time);
      setSelectedEndSlot(null);
      setShowBookingForm(false);
    } else if (!selectedEndSlot) {
      // Second selection - end slot
      const startIndex = HOURS.indexOf(selectedStartSlot);
      const endIndex = HOURS.indexOf(time);
      
      if (endIndex >= startIndex) {
        if (endIndex === startIndex) {
          // Same slot clicked - book just 30 minutes
          setShowBookingForm(true);
        } else {
          // Valid range selected
          setSelectedEndSlot(time);
          setShowBookingForm(true);
        }
      } else {
        // Invalid range - reset to new start
        setSelectedStartSlot(time);
        setSelectedEndSlot(null);
        setShowBookingForm(false);
      }
    } else {
      // Already have both slots - reset to new start
      setSelectedStartSlot(time);
      setSelectedEndSlot(null);
      setShowBookingForm(false);
    }
  }, [selectedStartSlot, selectedEndSlot]);

  const resetSelection = useCallback(() => {
    setSelectedStartSlot(null);
    setSelectedEndSlot(null);
    setShowBookingForm(false);
  }, []);

  const confirmSelection = useCallback(() => {
    setShowBookingForm(true);
  }, []);

  const isInSelectedRange = useCallback((time: string): boolean => {
    if (!selectedStartSlot || !selectedEndSlot) return false;
    
    const startIndex = HOURS.indexOf(selectedStartSlot);
    const endIndex = HOURS.indexOf(selectedEndSlot);
    const currentIndex = HOURS.indexOf(time);
    
    return currentIndex >= startIndex && currentIndex <= endIndex;
  }, [selectedStartSlot, selectedEndSlot]);

  const getSelectedDuration = useCallback((): { start: string; end: string } | null => {
    if (!selectedStartSlot) return null;
    
    let endTime: string;
    if (selectedEndSlot) {
      const endIndex = HOURS.indexOf(selectedEndSlot);
      endTime = HOURS[endIndex + 1] || '20:00';
    } else {
      // If no end slot selected, book just 30 minutes
      const startIndex = HOURS.indexOf(selectedStartSlot);
      endTime = HOURS[startIndex + 1] || '20:00';
    }
    
    return {
      start: selectedStartSlot,
      end: endTime
    };
  }, [selectedStartSlot, selectedEndSlot]);

  return {
    selectedStartSlot,
    selectedEndSlot,
    showBookingForm,
    selectTimeSlot,
    resetSelection,
    confirmSelection,
    isInSelectedRange,
    getSelectedDuration
  };
}