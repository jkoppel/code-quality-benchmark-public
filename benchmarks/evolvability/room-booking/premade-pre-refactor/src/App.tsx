import React, { useState } from 'react';
import './App.css';
import { Room, Booking } from './types';
import { ROOMS } from './constants';
import RoomList from './components/RoomList';
import BookingCalendar from './components/BookingCalendar';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const getBookingsForRoom = (roomId: string): Booking[] => {
    const room = ROOMS.find(r => r.id === roomId);
    
    if (room?.isVirtual && room.requiredRooms) {
      return bookings.filter(b => 
        room.requiredRooms!.includes(b.roomId) || b.roomId === roomId
      );
    }
    
    const grandBallroom = ROOMS.find(r => r.id === 'grand-ballroom');
    if (grandBallroom?.requiredRooms?.includes(roomId)) {
      return bookings.filter(b => 
        b.roomId === roomId || b.roomId === 'grand-ballroom'
      );
    }
    
    return bookings.filter(b => b.roomId === roomId);
  };

  const handleBooking = (name: string, date: string, hour: number) => {
    if (!selectedRoom) return;

    const newBookingId = `${Date.now()}-${Math.random()}`;
    
    if (selectedRoom.isVirtual && selectedRoom.requiredRooms) {
      const newBookings = selectedRoom.requiredRooms.map(roomId => ({
        id: `${newBookingId}-${roomId}`,
        roomId,
        name,
        date,
        hour
      }));
      
      newBookings.push({
        id: newBookingId,
        roomId: selectedRoom.id,
        name,
        date,
        hour
      });
      
      setBookings([...bookings, ...newBookings]);
    } else {
      const newBooking: Booking = {
        id: newBookingId,
        roomId: selectedRoom.id,
        name,
        date,
        hour
      };
      setBookings([...bookings, newBooking]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Room Booking System</h1>
      </header>
      
      <div className="main-content">
        <aside className="sidebar">
          <RoomList 
            rooms={ROOMS}
            selectedRoom={selectedRoom}
            onRoomSelect={setSelectedRoom}
          />
        </aside>
        
        <main className="content">
          {selectedRoom ? (
            <BookingCalendar 
              room={selectedRoom}
              bookings={getBookingsForRoom(selectedRoom.id)}
              onBook={handleBooking}
            />
          ) : (
            <div className="no-selection">
              <p>Please select a room to view availability and make bookings.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;