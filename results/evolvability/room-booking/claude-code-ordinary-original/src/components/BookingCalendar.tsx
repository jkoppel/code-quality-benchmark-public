import React, { useState } from 'react';
import { Booking } from '../types';
import { UI_MESSAGES } from '../constants';
import { formatDateLong } from '../utils/dateUtils';
import { useCalendarState } from '../hooks/useCalendarState';
import { checkResourceAvailability } from '../services/bookingService';
import DateNavigation from './DateNavigation';
import TimeSlots from './TimeSlots';
import BookingForm from './BookingForm';

interface BookingCalendarProps {
  selectedRoom: string | null;
  selectedDate: string;
  bookings: Booking[];
  onBook: (roomName: string, date: string, startTime: string, endTime: string, userName: string, resources?: string[]) => void;
  onUnbook: (bookingId: string) => void;
  onDateChange: (date: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedRoom,
  selectedDate,
  bookings,
  onBook,
  onUnbook,
  onDateChange
}) => {
  const {
    selectedSlot,
    selectedEndSlot,
    userName,
    showBookingForm,
    setUserName,
    resetState,
    handleSlotClick,
    getEndTime
  } = useCalendarState();

  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [resourceError, setResourceError] = useState<string>('');

  const handleBook = () => {
    if (selectedSlot && userName.trim()) {
      const endTime = getEndTime();
      
      // Check resource availability
      if (selectedResources.length > 0) {
        const resourcesAvailable = checkResourceAvailability(
          selectedResources,
          selectedDate,
          selectedSlot,
          endTime,
          bookings
        );
        
        if (!resourcesAvailable) {
          setResourceError(UI_MESSAGES.RESOURCE_UNAVAILABLE);
          return;
        }
      }
      
      onBook(selectedRoom!, selectedDate, selectedSlot, endTime, userName.trim(), selectedResources);
      resetState();
      setSelectedResources([]);
      setResourceError('');
    }
  };

  const handleResourcesChange = (resources: string[]) => {
    setSelectedResources(resources);
    setResourceError('');
  };

  const onSlotClick = (time: string) => {
    handleSlotClick(time, selectedRoom!, selectedDate, bookings, onUnbook);
  };

  if (!selectedRoom) {
    return <div className="calendar-container">{UI_MESSAGES.SELECT_ROOM}</div>;
  }

  return (
    <div className="calendar-container">
      <DateNavigation 
        selectedDate={selectedDate} 
        onDateChange={onDateChange} 
      />

      <h3>{selectedRoom} - {formatDateLong(selectedDate)}</h3>
      
      <TimeSlots
        selectedRoom={selectedRoom}
        selectedDate={selectedDate}
        bookings={bookings}
        selectedSlot={selectedSlot}
        selectedEndSlot={selectedEndSlot}
        onSlotClick={onSlotClick}
      />

      {showBookingForm && selectedSlot && (
        <BookingForm
          roomName={selectedRoom}
          startTime={selectedSlot}
          endTime={getEndTime()}
          userName={userName}
          selectedResources={selectedResources}
          onUserNameChange={setUserName}
          onResourcesChange={handleResourcesChange}
          onConfirm={handleBook}
          onCancel={resetState}
        />
      )}

      {resourceError && (
        <div className="error-message">{resourceError}</div>
      )}

      {selectedSlot && !selectedEndSlot && !showBookingForm && (
        <p className="instruction">{UI_MESSAGES.SLOT_INSTRUCTION}</p>
      )}
    </div>
  );
};

export default BookingCalendar;