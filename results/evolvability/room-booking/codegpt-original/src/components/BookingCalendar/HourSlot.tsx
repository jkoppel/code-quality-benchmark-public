import React from "react";
import { HourSlotProps } from "./types";
import { formatHour } from "../../utils/dateUtils";

/**
 * HourSlot Component
 * Represents a single time slot in the calendar
 * Follows Single Responsibility Principle - only handles one hour slot
 */
const HourSlot: React.FC<HourSlotProps> = ({
  hour,
  isBooked,
  booking,
  onClick,
  className = "",
}) => {
  const handleClick = () => {
    if (!isBooked) {
      onClick(hour);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === " ") && !isBooked) {
      event.preventDefault();
      onClick(hour);
    }
  };

  const slotClassName = `hour-slot ${
    isBooked ? "booked" : "available"
  } ${className}`.trim();

  return (
    <div
      className={slotClassName}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={isBooked ? -1 : 0}
      role="button"
      aria-label={`${formatHour(hour)} - ${isBooked ? "Booked" : "Available"}`}
      aria-disabled={isBooked}
    >
      <div className="hour-time">{formatHour(hour)}</div>

      {isBooked && booking && (
        <div className="booking-info">
          <span className="booked-by">Booked by:</span>
          <span className="booker-name">{booking.name}</span>
        </div>
      )}

      {!isBooked && (
        <div className="availability-indicator">
          <span className="available-text">Available</span>
        </div>
      )}
    </div>
  );
};

export default HourSlot;
