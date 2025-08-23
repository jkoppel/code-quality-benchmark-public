import React from "react";
import { DateSelectorProps } from "./types";
import { formatDateForDisplay } from "../../utils/dateUtils";

/**
 * DateSelector Component
 * Responsible only for date selection (Single Responsibility Principle)
 * Reusable and focused on one concern
 */
const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
}) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(event.target.value);
  };

  return (
    <div className="date-selector">
      <label htmlFor="date-input" className="date-label">
        Select Date:
      </label>
      <input
        id="date-input"
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        min={minDate}
        max={maxDate}
        className="date-input"
        aria-label="Select booking date"
      />
      <div className="selected-date-display">
        {formatDateForDisplay(selectedDate)}
      </div>
    </div>
  );
};

export default DateSelector;
