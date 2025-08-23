export interface Booking {
  id: string;
  roomId: string;
  name: string;
  date: string;
  hour: number;
}

export interface Room {
  id: string;
  name: string;
  isVirtual?: boolean;
  requiredRooms?: string[];
}