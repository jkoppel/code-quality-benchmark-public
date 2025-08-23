import React from 'react';
import './App.css';
import { BookingProvider } from './contexts/BookingContext';
import { RoomProvider } from './contexts/RoomContext';
import RoomList from './components/RoomList';
import BookingCalendar from './components/BookingCalendar';

function App() {
  return (
    <BookingProvider>
      <RoomProvider>
        <div className="App">
          <header className="App-header">
            <h1>Room Booking System</h1>
          </header>
          <div className="main-container">
            <RoomList />
            <BookingCalendar />
          </div>
        </div>
      </RoomProvider>
    </BookingProvider>
  );
}

export default App;