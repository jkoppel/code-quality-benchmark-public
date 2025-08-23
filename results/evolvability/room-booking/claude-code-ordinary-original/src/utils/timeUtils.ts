import { HOURS } from '../constants';

/**
 * Gets the next time slot after the given time
 */
export const getNextTimeSlot = (time: string): string => {
  const currentIndex = HOURS.indexOf(time);
  return HOURS[currentIndex + 1] || '20:00';
};

/**
 * Gets the time slot index for a given time
 */
export const getTimeSlotIndex = (time: string): number => {
  return HOURS.indexOf(time);
};

/**
 * Checks if a time range is valid (end time after start time)
 */
export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  const startIndex = getTimeSlotIndex(startTime);
  const endIndex = getTimeSlotIndex(endTime);
  return endIndex >= startIndex;
};

/**
 * Gets all time slots between start and end (inclusive)
 */
export const getTimeSlotRange = (startTime: string, endTime: string): string[] => {
  const startIndex = getTimeSlotIndex(startTime);
  const endIndex = getTimeSlotIndex(endTime);
  return HOURS.slice(startIndex, endIndex + 1);
};

/**
 * Checks if two time slots overlap
 */
export const isTimeSlotOverlapping = (
  slot1: { startTime: string; endTime: string },
  slot2: { startTime: string; endTime: string }
): boolean => {
  const slot1Start = getTimeSlotIndex(slot1.startTime);
  const slot1End = getTimeSlotIndex(slot1.endTime);
  const slot2Start = getTimeSlotIndex(slot2.startTime);
  const slot2End = getTimeSlotIndex(slot2.endTime);

  return !(slot1End <= slot2Start || slot2End <= slot1Start);
};