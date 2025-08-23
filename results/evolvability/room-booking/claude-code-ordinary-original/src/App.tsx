import React, { useState } from 'react';
import './App.css';
import RoomList from './components/RoomList';
import BookingCalendar from './components/BookingCalendar';
import { useBookings } from './hooks/useBookings';
import { getCurrentDate } from './utils/dateUtils';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());
  const { bookings, addBooking, removeBooking, findBookingAtSlot } = useBookings();

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
          onUnbook={removeBooking}
          onDateChange={setSelectedDate}
          findBookingAtSlot={findBookingAtSlot}
        />
      </div>
    </div>
  );
}

export default App;