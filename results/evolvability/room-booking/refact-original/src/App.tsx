import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import RoomList from './components/RoomList';
import BookingCalendar from './components/BookingCalendar/BookingCalendar';
import { useBookings } from './hooks/useBookings';
import { getTodayString } from './utils/dateUtils';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const { bookings, addBooking, removeBooking } = useBookings();

  return (
    <div className="App">
      <Header />
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
        />
      </div>
    </div>
  );
}

export default App;