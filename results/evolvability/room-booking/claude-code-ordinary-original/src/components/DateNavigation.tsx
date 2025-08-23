import React from 'react';
import { addDays } from '../utils/dateUtils';

interface DateNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange
}) => {
  const handlePreviousDay = () => {
    const previousDate = addDays(selectedDate, -1);
    onDateChange(previousDate);
  };

  const handleNextDay = () => {
    const nextDate = addDays(selectedDate, 1);
    onDateChange(nextDate);
  };

  return (
    <div className="date-navigation">
      <button onClick={handlePreviousDay}>← Previous Day</button>
      
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
      
      <button onClick={handleNextDay}>Next Day →</button>
    </div>
  );
};

export default DateNavigation;