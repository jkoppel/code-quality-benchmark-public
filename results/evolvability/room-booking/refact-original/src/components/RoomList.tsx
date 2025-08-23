import React from 'react';
import { ROOMS } from '../constants';

interface RoomListProps {
  selectedRoom: string | null;
  onRoomSelect: (roomName: string) => void;
}

const RoomList: React.FC<RoomListProps> = ({ selectedRoom, onRoomSelect }) => {
  return (
    <div className="room-list">
      <h2>Rooms</h2>
      <ul>
        {ROOMS.map((room) => (
          <li 
            key={room.name}
            className={selectedRoom === room.name ? 'selected' : ''}
            onClick={() => onRoomSelect(room.name)}
          >
            {room.name}
            {room.isVirtual && <span className="virtual-badge"> (Virtual)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;