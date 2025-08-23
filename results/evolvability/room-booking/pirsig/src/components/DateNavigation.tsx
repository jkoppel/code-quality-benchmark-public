import React from 'react';
import { DateUtils } from '../utils/dateUtils';

interface DateNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange
}) => {
  const handlePreviousDay = () => {
    onDateChange(DateUtils.addDays(selectedDate, -1));
  };
  
  const handleNextDay = () => {
    onDateChange(DateUtils.addDays(selectedDate, 1));
  };
  
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (DateUtils.isValidDate(newDate)) {
      onDateChange(newDate);
    }
  };
  
  return (
    <div className="date-navigation">
      <button 
        onClick={handlePreviousDay}
        aria-label="Previous day"
      >
        ← Previous Day
      </button>
      
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateInputChange}
        aria-label="Select date"
      />
      
      <button 
        onClick={handleNextDay}
        aria-label="Next day"
      >
        Next Day →
      </button>
    </div>
  );
};

export default DateNavigation;