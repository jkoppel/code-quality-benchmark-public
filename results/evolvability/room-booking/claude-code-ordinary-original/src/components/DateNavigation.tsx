import React from 'react';
import { DateNavigationProps } from '../types';
import { getPreviousDay, getNextDay } from '../utils/dateUtils';

const DateNavigation: React.FC<DateNavigationProps> = ({ selectedDate, onDateChange }) => {
  const handlePreviousDay = () => {
    onDateChange(getPreviousDay(selectedDate));
  };

  const handleNextDay = () => {
    onDateChange(getNextDay(selectedDate));
  };

  const handleDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(event.target.value);
  };

  return (
    <div className="date-navigation">
      <button onClick={handlePreviousDay}>
        ← Previous Day
      </button>
      
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateInputChange}
      />
      
      <button onClick={handleNextDay}>
        Next Day →
      </button>
    </div>
  );
};

export default DateNavigation;