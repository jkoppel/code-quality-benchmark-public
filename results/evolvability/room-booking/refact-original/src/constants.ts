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
