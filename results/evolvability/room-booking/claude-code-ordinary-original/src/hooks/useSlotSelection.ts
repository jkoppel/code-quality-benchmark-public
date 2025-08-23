import { useState, useCallback } from 'react';
import { HOURS } from '../constants';
import { getTimeSlotIndex, isTimeInRange } from '../utils/timeUtils';

export const useSlotSelection = () => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState<string | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedSlot(null);
    setSelectedEndSlot(null);
  }, []);

  const selectStartSlot = useCallback((time: string) => {
    setSelectedSlot(time);
    setSelectedEndSlot(null);
  }, []);

  const selectEndSlot = useCallback((time: string) => {
    setSelectedEndSlot(time);
  }, []);

  const isSlotSelected = useCallback((time: string): boolean => {
    return time === selectedSlot;
  }, [selectedSlot]);

  const isSlotInRange = useCallback((time: string): boolean => {
    if (!selectedSlot || !selectedEndSlot) return false;
    return isTimeInRange(time, selectedSlot, selectedEndSlot);
  }, [selectedSlot, selectedEndSlot]);

  const getEndTime = useCallback((): string => {
    if (selectedEndSlot) {
      const endIndex = getTimeSlotIndex(selectedEndSlot);
      return HOURS[endIndex + 1] || '20:00';
    } else if (selectedSlot) {
      // If no end slot selected, book just 30 minutes
      const startIndex = getTimeSlotIndex(selectedSlot);
      return HOURS[startIndex + 1] || '20:00';
    }
    return '20:00';
  }, [selectedSlot, selectedEndSlot]);

  const hasValidSelection = useCallback((): boolean => {
    return selectedSlot !== null;
  }, [selectedSlot]);

  return {
    selectedSlot,
    selectedEndSlot,
    clearSelection,
    selectStartSlot,
    selectEndSlot,
    isSlotSelected,
    isSlotInRange,
    getEndTime,
    hasValidSelection
  };
};