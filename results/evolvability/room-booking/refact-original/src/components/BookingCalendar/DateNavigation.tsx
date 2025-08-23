import React from 'react';
import { addDays } from '../../utils/dateUtils';

interface DateNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange
}) => {
  const handlePreviousDay = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  return (
    <div className="date-navigation">
      <button onClick={handlePreviousDay}>
        ← Previous Day
      </button>
      
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
      
      <button onClick={handleNextDay}>
        Next Day →
      </button>
    </div>
  );
};

export default DateNavigation;
