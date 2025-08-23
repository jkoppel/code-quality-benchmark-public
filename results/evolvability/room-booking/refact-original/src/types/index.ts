export interface Booking {
  id: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
}

export interface Room {
  name: string;
  isVirtual?: boolean;
  components?: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booking?: Booking;
}
