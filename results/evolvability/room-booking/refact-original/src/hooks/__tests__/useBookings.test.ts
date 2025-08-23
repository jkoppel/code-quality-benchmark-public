import { renderHook, act } from '@testing-library/react';
import { useBookings } from '../useBookings';
import * as bookingService from '../../services/bookingService';

// Mock the booking service
jest.mock('../../services/bookingService');

describe('useBookings', () => {
  const mockCreateBooking = bookingService.createBooking as jest.MockedFunction<typeof bookingService.createBooking>;
  const mockCancelBooking = bookingService.cancelBooking as jest.MockedFunction<typeof bookingService.cancelBooking>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty bookings', () => {
    const { result } = renderHook(() => useBookings());
    
    expect(result.current.bookings).toEqual([]);
  });

  it('should initialize with provided bookings', () => {
    const initialBookings = [
      {
        id: '123',
        roomName: 'Anaconda',
        date: '2023-12-01',
        startTime: '09:00',
        endTime: '10:00',
        userName: 'John Doe'
      }
    ];

    const { result } = renderHook(() => useBookings(initialBookings));
    
    expect(result.current.bookings).toEqual(initialBookings);
  });

  it('should add booking', () => {
    const newBookings = [
      {
        id: '456',
        roomName: 'Baboon',
        date: '2023-12-01',
        startTime: '11:00',
        endTime: '12:00',
        userName: 'Jane Smith'
      }
    ];

    mockCreateBooking.mockReturnValue(newBookings);

    const { result } = renderHook(() => useBookings());

    act(() => {
      result.current.addBooking('Baboon', '2023-12-01', '11:00', '12:00', 'Jane Smith');
    });

    expect(mockCreateBooking).toHaveBeenCalledWith('Baboon', '2023-12-01', '11:00', '12:00', 'Jane Smith');
    expect(result.current.bookings).toEqual(newBookings);
  });

  it('should remove booking', () => {
    const initialBookings = [
      {
        id: '123',
        roomName: 'Anaconda',
        date: '2023-12-01',
        startTime: '09:00',
        endTime: '10:00',
        userName: 'John Doe'
      }
    ];

    mockCancelBooking.mockReturnValue([]);

    const { result } = renderHook(() => useBookings(initialBookings));

    act(() => {
      result.current.removeBooking('123');
    });

    expect(mockCancelBooking).toHaveBeenCalledWith(initialBookings, '123');
    expect(result.current.bookings).toEqual([]);
  });
});
