import React, { useState } from 'react';
import './App.css';
import RoomList from './components/RoomList';
import BookingCalendar from './components/BookingCalendar';
import { useBookings } from './hooks/useBookings';
import { getTodayDateString } from './utils/dateUtils';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const { bookings, addBooking, removeBookingById } = useBookings();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Room Booking System</h1>
      </header>
      <div className="main-container">
        <RoomList
          selectedRoom={selectedRoom}
          onRoomSelect={setSelectedRoom}
        />
        <BookingCalendar
          selectedRoom={selectedRoom}
          selectedDate={selectedDate}
          bookings={bookings}
          onBook={addBooking}
          onUnbook={removeBookingById}
          onDateChange={setSelectedDate}
        />
      </div>
    </div>
  );
}

export default App;