import React from 'react';
import { DateUtils } from '../../utils/dateUtils';

interface DateNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange
}) => {
  const handlePreviousDay = () => {
    const previousDate = DateUtils.addDays(selectedDate, -1);
    onDateChange(previousDate);
  };

  const handleNextDay = () => {
    const nextDate = DateUtils.addDays(selectedDate, 1);
    onDateChange(nextDate);
  };

  return (
    <div className=\"date-navigation\">
      <button onClick={handlePreviousDay}>
        ← Previous Day
      </button>
      
      <input
        type=\"date\"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
      
      <button onClick={handleNextDay}>
        Next Day →
      </button>
    </div>
  );
};