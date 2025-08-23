import { Room } from './types';

export const ROOMS: Room[] = [
  { name: 'Anaconda' },
  { name: 'Baboon' },
  { name: 'Ballroom 1' },
  { name: 'Ballroom 2' },
  { name: 'Ballroom 3' },
  { 
    name: 'Grand Ballroom', 
    isVirtual: true,
    components: ['Ballroom 1', 'Ballroom 2', 'Ballroom 3']
  }
];

export const HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

// UI Constants
export const ROOM_NAMES = {
  GRAND_BALLROOM: 'Grand Ballroom',
  BALLROOM_1: 'Ballroom 1',
  BALLROOM_2: 'Ballroom 2',
  BALLROOM_3: 'Ballroom 3',
  ANACONDA: 'Anaconda',
  BABOON: 'Baboon'
} as const;

export const TIME_SLOTS = {
  SLOT_DURATION_MINUTES: 30,
  DEFAULT_END_TIME: '20:00',
  BUSINESS_HOURS: {
    START: '08:00',
    END: '19:30'
  }
} as const;

// Resources available for booking
export const RESOURCES = {
  SPEAKERS: { name: 'Speakers', maxQuantity: 2 },
  DOCUMENT_CAMERAS: { name: 'Document Cameras', maxQuantity: 2 },
  LAPTOP_CARTS: { name: 'Laptop Carts', maxQuantity: 2 }
} as const;

export const RESOURCE_TYPES = ['Speakers', 'Document Cameras', 'Laptop Carts'] as const;

export const UI_MESSAGES = {
  SELECT_ROOM: 'Please select a room',
  CONFIRM_UNBOOK: 'Unbook this slot?',
  BOOKING_CONFLICT: 'Selected range contains booked slots',
  SLOT_INSTRUCTION: 'Click the same slot again for 30-min booking, or click another slot for longer duration',
  RESOURCE_UNAVAILABLE: 'Selected resources are not available for this time slot'
} as const;