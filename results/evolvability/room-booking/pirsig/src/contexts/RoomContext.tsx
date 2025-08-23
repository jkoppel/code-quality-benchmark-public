import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RoomContextType {
  selectedRoom: string | null;
  setSelectedRoom: (roomName: string | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoomContext = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  
  return (
    <RoomContext.Provider value={{ selectedRoom, setSelectedRoom }}>
      {children}
    </RoomContext.Provider>
  );
};