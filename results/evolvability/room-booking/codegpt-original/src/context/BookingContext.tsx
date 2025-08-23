import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Booking } from "../types";

/**
 * BookingContext for state management
 * Follows Context Pattern and Reducer Pattern for predictable state updates
 */

// State interface
export interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

// Action types
export type BookingAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_BOOKINGS"; payload: Booking[] }
  | { type: "ADD_BOOKING"; payload: Booking }
  | { type: "REMOVE_BOOKING"; payload: string };

// Initial state
const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

// Reducer function
const bookingReducer = (
  state: BookingState,
  action: BookingAction
): BookingState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_BOOKINGS":
      return {
        ...state,
        bookings: action.payload,
        loading: false,
        error: null,
      };

    case "ADD_BOOKING":
      return {
        ...state,
        bookings: [...state.bookings, action.payload],
        loading: false,
        error: null,
      };

    case "REMOVE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.filter((b) => b.id !== action.payload),
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};

// Context interface
export interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}

// Create context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider component
export interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const value: BookingContextType = {
    state,
    dispatch,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

// Custom hook to use booking context
export const useBookingContext = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return context;
};
