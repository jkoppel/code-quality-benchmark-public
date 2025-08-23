/**
 * Formats a date for display in long format
 */
export const formatDateLong = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Gets the ISO date string for today
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Adds or subtracts days from a date string
 */
export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Gets the previous day from a date string
 */
export const getPreviousDay = (dateString: string): string => {
  return addDays(dateString, -1);
};

/**
 * Gets the next day from a date string
 */
export const getNextDay = (dateString: string): string => {
  return addDays(dateString, 1);
};