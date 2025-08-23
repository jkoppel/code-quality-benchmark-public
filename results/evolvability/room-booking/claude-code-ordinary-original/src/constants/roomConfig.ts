import { Room } from '../types';

export const ROOMS: Room[] = [
  { id: 'anaconda', name: 'Anaconda' },
  { id: 'baboon', name: 'Baboon' },
  { id: 'ballroom1', name: 'Ballroom 1' },
  { id: 'ballroom2', name: 'Ballroom 2' },
  { id: 'ballroom3', name: 'Ballroom 3' },
  { 
    id: 'grand-ballroom', 
    name: 'Grand Ballroom',
    isVirtual: true,
    requiredRooms: ['ballroom1', 'ballroom2', 'ballroom3']
  }
];