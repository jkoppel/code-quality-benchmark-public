import React from 'react';
import { Room } from '../types';

interface RoomListProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, selectedRoom, onRoomSelect }) => {
  return (
    <div className="room-list">
      <h2>Available Rooms</h2>
      <ul>
        {rooms.map(room => (
          <li 
            key={room.id}
            className={selectedRoom?.id === room.id ? 'selected' : ''}
            onClick={() => onRoomSelect(room)}
          >
            {room.name}
            {room.isVirtual && <span className="virtual-tag"> (Combines all ballrooms)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;