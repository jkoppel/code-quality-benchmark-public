import React from 'react';
import { Room } from '../../types';

interface RoomListItemProps {
  room: Room;
  isSelected: boolean;
  onSelect: (room: Room) => void;
}

const RoomListItem: React.FC<RoomListItemProps> = ({ room, isSelected, onSelect }) => {
  return (
    <li 
      className={isSelected ? 'selected' : ''}
      onClick={() => onSelect(room)}
    >
      {room.name}
      {room.isVirtual && <span className="virtual-tag"> (Combines all ballrooms)</span>}
    </li>
  );
};

export default RoomListItem;