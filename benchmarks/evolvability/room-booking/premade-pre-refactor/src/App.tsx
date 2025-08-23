import React, { useState } from 'react';
import './App.css';
import RoomList from './components/RoomList';
import BookingCalendar from './components/BookingCalendar';
import { Booking } from './types';
import { ROOMS } from './constants';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [bookings, setBookings] = useState<Booking[]>([]);

  const handleBook = (roomName: string, date: string, startTime: string, endTime: string, userName: string) => {
    const room = ROOMS.find(r => r.name === roomName);
    const newBookingId = `${Date.now()}-${Math.random()}`;
    const newBookings: Booking[] = [];

    if (room?.isVirtual && room.components) {
      room.components.forEach(component => {
        newBookings.push({
          id: `${newBookingId}-${component}`,
          roomName: component,
          date,
          startTime,
          endTime,
          userName
        });
      });
    }

    newBookings.push({
      id: newBookingId,
      roomName,
      date,
      startTime,
      endTime,
      userName
    });

    setBookings([...bookings, ...newBookings]);
  };

  const handleUnbook = (bookingId: string) => {
    const bookingToRemove = bookings.find(b => b.id === bookingId);
    
    if (bookingToRemove) {
      let bookingsToRemove = [bookingId];
      
      const room = ROOMS.find(r => r.name === bookingToRemove.roomName);
      if (room?.isVirtual && room.components) {
        const relatedBookings = bookings.filter(b =>
          b.id.startsWith(bookingId.split('-')[0]) &&
          b.date === bookingToRemove.date &&
          b.startTime === bookingToRemove.startTime
        );
        bookingsToRemove = relatedBookings.map(b => b.id);
      }
      
      if (bookingToRemove.roomName === 'Grand Ballroom') {
        const baseId = bookingId.split('-')[0];
        bookingsToRemove = bookings
          .filter(b => b.id.startsWith(baseId))
          .map(b => b.id);
      }
      
      setBookings(bookings.filter(b => !bookingsToRemove.includes(b.id)));
    }
  };

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
          onBook={handleBook}
          onUnbook={handleUnbook}
          onDateChange={setSelectedDate}
        />
      </div>
    </div>
  );
}

export default App;