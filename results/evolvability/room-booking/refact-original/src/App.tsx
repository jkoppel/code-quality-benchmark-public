import React, { useState } from 'react';
import './App.css';
import { Room } from './types';
import { ROOMS } from './constants/roomConfig';
import RoomList from './components/RoomList';
import BookingCalendar from './components/BookingCalendar';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
            <BookingCalendar room={selectedRoom} />
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