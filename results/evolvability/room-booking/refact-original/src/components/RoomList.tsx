import React from 'react';
import { Room } from '../types';
import RoomListItem from './RoomList/RoomListItem';

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
          <RoomListItem
            key={room.id}
            room={room}
            isSelected={selectedRoom?.id === room.id}
            onSelect={onRoomSelect}
          />
        ))}
      </ul>
    </div>
  );
};

export default RoomList;