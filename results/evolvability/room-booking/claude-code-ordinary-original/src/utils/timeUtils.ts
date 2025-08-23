import { HOURS } from '../constants';

export const getNextTimeSlot = (currentTime: string): string => {
  const currentIndex = HOURS.indexOf(currentTime);
  return HOURS[currentIndex + 1] || '20:00';
};

export const getTimeSlotIndex = (time: string): number => {
  return HOURS.indexOf(time);
};

export const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
  const timeIndex = getTimeSlotIndex(time);
  const startIndex = getTimeSlotIndex(startTime);
  const endIndex = getTimeSlotIndex(endTime);
  
  return timeIndex >= startIndex && timeIndex <= endIndex;
};

export const getTimeRange = (startTime: string, endTime: string): string[] => {
  const startIndex = getTimeSlotIndex(startTime);
  const endIndex = getTimeSlotIndex(endTime);
  
  return HOURS.slice(startIndex, endIndex + 1);
};