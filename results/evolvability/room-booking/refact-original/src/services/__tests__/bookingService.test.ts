import { createBooking, cancelBooking, findBookingAtTime, hasTimeRangeConflict } from '../bookingService';
import { Booking, Room } from '../../types';

// Mock the constants module
jest.mock('../../constants', () => ({
  ROOMS: [
    { name: 'Anaconda' },
    { name: 'Ballroom 1' },
    { name: 'Ballroom 2' },
    { name: 'Ballroom 3' },
    { 
      name: 'Grand Ballroom', 
      isVirtual: true,
      components: ['Ballroom 1', 'Ballroom 2', 'Ballroom 3']
    }
  ]
}));

describe('bookingService', () => {

  describe('createBooking', () => {
    beforeEach(() => {
      // Reset Date.now mock
      jest.spyOn(Date, 'now').mockReturnValue(1234567890000);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create a single booking for regular room', () => {
      const bookings = createBooking('Anaconda', '2023-12-01', '09:00', '10:00', 'John Doe');
      
      expect(bookings).toHaveLength(1);
      expect(bookings[0]).toEqual({
        id: '1234567890000-0.5',
        roomName: 'Anaconda',
        date: '2023-12-01',
        startTime: '09:00',
        endTime: '10:00',
        userName: 'John Doe'
      });
    });

    it('should create multiple bookings for virtual room', () => {
      const bookings = createBooking('Grand Ballroom', '2023-12-01', '09:00', '10:00', 'John Doe');
      
      expect(bookings).toHaveLength(4); // Main room + 3 components
      expect(bookings[0].roomName).toBe('Grand Ballroom');
      expect(bookings[1].roomName).toBe('Ballroom 1');
      expect(bookings[2].roomName).toBe('Ballroom 2');
      expect(bookings[3].roomName).toBe('Ballroom 3');
    });

    it('should return empty array for non-existent room', () => {
      const bookings = createBooking('NonExistent', '2023-12-01', '09:00', '10:00', 'John Doe');
      expect(bookings).toHaveLength(0);
    });
  });

  describe('cancelBooking', () => {
    const sampleBookings: Booking[] = [
      {
        id: '123-0.5',
        roomName: 'Grand Ballroom',
        date: '2023-12-01',
        startTime: '09:00',
        endTime: '10:00',
        userName: 'John Doe'
      },
      {
        id: '123-0.5-Ballroom 1',
        roomName: 'Ballroom 1',
        date: '2023-12-01',
        startTime: '09:00',
        endTime: '10:00',
        userName: 'John Doe'
      },
      {
        id: '456-0.3',
        roomName: 'Anaconda',
        date: '2023-12-01',
        startTime: '11:00',
        endTime: '12:00',
        userName: 'Jane Smith'
      }
    ];

    it('should cancel single booking', () => {
      const result = cancelBooking(sampleBookings, '456-0.3');
      expect(result).toHaveLength(2);
      expect(result.find(b => b.id === '456-0.3')).toBeUndefined();
    });

    it('should cancel Grand Ballroom booking and all related bookings', () => {
      const result = cancelBooking(sampleBookings, '123-0.5');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('456-0.3');
    });

    it('should return original array if booking not found', () => {
      const result = cancelBooking(sampleBookings, 'non-existent');
      expect(result).toEqual(sampleBookings);
    });
  });

  describe('findBookingAtTime', () => {
    const sampleBookings: Booking[] = [
      {
        id: '123',
        roomName: 'Anaconda',
        date: '2023-12-01',
        startTime: '09:00',
        endTime: '10:00',
        userName: 'John Doe'
      },
      {
        id: '456',
        roomName: 'Grand Ballroom',
        date: '2023-12-01',
        startTime: '14:00',
        endTime: '15:00',
        userName: 'Jane Smith'
      }
    ];

    it('should find direct booking', () => {
      const room: Room = { name: 'Anaconda' };
      const booking = findBookingAtTime(sampleBookings, room, '2023-12-01', '09:30');
      expect(booking?.id).toBe('123');
    });

    it('should return undefined for available slot', () => {
      const room: Room = { name: 'Anaconda' };
      const booking = findBookingAtTime(sampleBookings, room, '2023-12-01', '11:00');
      expect(booking).toBeUndefined();
    });

    it('should find Grand Ballroom booking when checking component room', () => {
      const room: Room = { name: 'Ballroom 1' };
      const booking = findBookingAtTime(sampleBookings, room, '2023-12-01', '14:30');
      expect(booking?.id).toBe('456');
    });
  });

  describe('hasTimeRangeConflict', () => {
    const sampleBookings: Booking[] = [
      {
        id: '123',
        roomName: 'Anaconda',
        date: '2023-12-01',
        startTime: '09:00',
        endTime: '10:00',
        userName: 'John Doe'
      }
    ];

    const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];

    it('should detect conflict', () => {
      const room: Room = { name: 'Anaconda' };
      const hasConflict = hasTimeRangeConflict(sampleBookings, room, '2023-12-01', '08:30', '09:30', timeSlots);
      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict for available range', () => {
      const room: Room = { name: 'Anaconda' };
      const hasConflict = hasTimeRangeConflict(sampleBookings, room, '2023-12-01', '10:30', '11:00', timeSlots);
      expect(hasConflict).toBe(false);
    });
  });
});
