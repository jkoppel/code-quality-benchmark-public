import { Room } from '../types';

export class RoomService {
  /**
   * Checks if a room is virtual (composed of other rooms)
   */
  static isVirtualRoom(room: Room): boolean {
    return Boolean(room.isVirtual && room.components && room.components.length > 0);
  }

  /**
   * Gets all component rooms for a virtual room
   */
  static getComponentRooms(room: Room, allRooms: Room[]): Room[] {
    if (!this.isVirtualRoom(room)) {
      return [];
    }
    
    return allRooms.filter(r => 
      room.components?.includes(r.name)
    );
  }

  /**
   * Finds virtual rooms that contain a specific component room
   */
  static findVirtualRoomsContaining(roomName: string, allRooms: Room[]): Room[] {
    return allRooms.filter(room => 
      this.isVirtualRoom(room) && 
      room.components?.includes(roomName)
    );
  }

  /**
   * Checks if a room is a component of any virtual room
   */
  static isComponentRoom(roomName: string, allRooms: Room[]): boolean {
    return this.findVirtualRoomsContaining(roomName, allRooms).length > 0;
  }

  /**
   * Gets the display name for a room, including virtual badge if applicable
   */
  static getDisplayName(room: Room): string {
    return this.isVirtualRoom(room) 
      ? `${room.name} (Virtual)` 
      : room.name;
  }
}