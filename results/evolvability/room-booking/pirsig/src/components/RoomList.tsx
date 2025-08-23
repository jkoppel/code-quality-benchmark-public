import React from 'react';
import { ROOMS } from '../constants';
import { useRoomContext } from '../contexts/RoomContext';
import { RoomService } from '../services/roomService';

const RoomList: React.FC = () => {
  const { selectedRoom, setSelectedRoom } = useRoomContext();
  
  return (
    <div className="room-list">
      <h2>Rooms</h2>
      <ul>
        {ROOMS.map((room) => (
          <li 
            key={room.name}
            className={selectedRoom === room.name ? 'selected' : ''}
            onClick={() => setSelectedRoom(room.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedRoom(room.name);
              }
            }}
            aria-pressed={selectedRoom === room.name}
            aria-label={`Select ${RoomService.getDisplayName(room)}`}
          >
            {room.name}
            {RoomService.isVirtualRoom(room) && (
              <span className="virtual-badge"> (Virtual)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;