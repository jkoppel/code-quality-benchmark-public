import { Booking } from '../types';
import { 
  createBookingsForRoom, 
  findRelatedBookingIds, 
  findRoomByName,
  isBallroomComponent 
} from '../utils/bookingUtils';

export class BookingService {
  private bookings: Booking[] = [];

  getBookings(): Booking[] {
    return [...this.bookings];
  }

  addBooking(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    userName: string
  ): Booking[] {
    const newBookings = createBookingsForRoom(roomName, date, startTime, endTime, userName);
    this.bookings.push(...newBookings);
    return this.getBookings();
  }

  removeBooking(bookingId: string): Booking[] {
    const targetBooking = this.bookings.find(b => b.id === bookingId);
    
    if (!targetBooking) {
      return this.getBookings();
    }

    const idsToRemove = findRelatedBookingIds(this.bookings, targetBooking);
    this.bookings = this.bookings.filter(b => !idsToRemove.includes(b.id));
    
    return this.getBookings();
  }

  findBookingAtSlot(roomName: string, date: string, time: string): Booking | undefined {
    const room = findRoomByName(roomName);
    
    // Check virtual room components
    if (room?.isVirtual && room.components) {
      const componentBooking = room.components.find(component =>
        this.bookings.some(b =>
          b.roomName === component &&
          b.date === date &&
          b.startTime <= time &&
          b.endTime > time
        )
      );

      if (componentBooking) {
        return this.bookings.find(b =>
          b.roomName === componentBooking &&
          b.date === date &&
          b.startTime <= time &&
          b.endTime > time
        );
      }
    }

    // Check Grand Ballroom conflicts with ballroom components
    if (!room?.isVirtual && isBallroomComponent(roomName)) {
      const grandBallroomBooking = this.bookings.find(b =>
        b.roomName === 'Grand Ballroom' &&
        b.date === date &&
        b.startTime <= time &&
        b.endTime > time
      );
      if (grandBallroomBooking) {
        return grandBallroomBooking;
      }
    }

    // Check direct booking
    return this.bookings.find(b =>
      b.roomName === roomName &&
      b.date === date &&
      b.startTime <= time &&
      b.endTime > time
    );
  }

  hasConflictInRange(roomName: string, date: string, startTime: string, endTime: string): boolean {
    // Implementation would check for conflicts in the time range
    // For now, this is a placeholder - would need to implement time range checking
    return false;
  }
}