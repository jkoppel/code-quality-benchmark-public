export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getCurrentDate = (): string => {
  return formatDateForInput(new Date());
};

export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDateForInput(date);
};

export const formatDisplayDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};