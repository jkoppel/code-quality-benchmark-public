import React from "react";
import { HoursGridProps } from "./types";
import {
  isHourBooked,
  findBookingByDateAndHour,
} from "../../utils/bookingUtils";
import HourSlot from "./HourSlot";

/**
 * HoursGrid Component
 * Responsible for rendering the grid of available time slots
 * Follows Single Responsibility Principle and Open/Closed Principle
 */
const HoursGrid: React.FC<HoursGridProps> = ({
  room,
  selectedDate,
  bookings,
  hours,
  onHourClick,
}) => {
  return (
    <div
      className="hours-grid"
      role="grid"
      aria-label={`Available time slots for ${room.name}`}
    >
      <div className="hours-grid-header">
        <h3>Available Time Slots</h3>
        <p>Click on an available slot to book it</p>
      </div>

      <div className="hours-grid-container">
        {hours.map((hour) => {
          const booked = isHourBooked(bookings, selectedDate, hour);
          const booking = findBookingByDateAndHour(
            bookings,
            selectedDate,
            hour
          );

          return (
            <HourSlot
              key={hour}
              hour={hour}
              isBooked={booked}
              booking={booking}
              onClick={onHourClick}
            />
          );
        })}
      </div>

      <div className="hours-grid-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color booked"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default HoursGrid;
