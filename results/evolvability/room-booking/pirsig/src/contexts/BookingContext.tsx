import React, { createContext, useContext, ReactNode } from 'react';
import { useBookingManager, BookingManagerState, BookingManagerActions } from '../hooks/useBookingManager';

type BookingContextType = BookingManagerState & BookingManagerActions;

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookingContext = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const bookingManager = useBookingManager();
  
  return (
    <BookingContext.Provider value={bookingManager}>
      {children}
    </BookingContext.Provider>
  );
};