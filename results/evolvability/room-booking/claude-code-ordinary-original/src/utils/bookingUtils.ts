export const generateBookingId = (): string => {
  return `${Date.now()}-${Math.random()}`;
};

export const parseBookingIdParts = (bookingId: string): { timestamp: string; random: string } => {
  const [timestamp, random] = bookingId.split('-');
  return { timestamp, random };
};