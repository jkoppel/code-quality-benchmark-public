import React, { useEffect, useRef } from "react";
import { BookingFormProps } from "./types";
import { formatHour, formatDateForDisplay } from "../../utils/dateUtils";

/**
 * BookingForm Component
 * Handles the booking form modal
 * Follows Single Responsibility Principle and provides accessibility features
 */
const BookingForm: React.FC<BookingFormProps> = ({
  isVisible,
  room,
  selectedDate,
  selectedHour,
  bookingName,
  onNameChange,
  onConfirm,
  onCancel,
  isLoading = false,
  error,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isVisible && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isVisible]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        onCancel();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isVisible, onCancel]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      onCancel();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoading && bookingName.trim()) {
      onConfirm();
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(event.target.value);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="booking-form-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-form-title"
    >
      <div className="booking-form">
        <header className="booking-form-header">
          <h3 id="booking-form-title">Book {room.name}</h3>
          <button
            type="button"
            className="close-button"
            onClick={onCancel}
            aria-label="Close booking form"
            disabled={isLoading}
          >
            ×
          </button>
        </header>

        <div className="booking-details">
          <div className="detail-item">
            <label>Room:</label>
            <span>{room.name}</span>
          </div>
          <div className="detail-item">
            <label>Date:</label>
            <span>{formatDateForDisplay(selectedDate)}</span>
          </div>
          <div className="detail-item">
            <label>Time:</label>
            <span>
              {selectedHour !== null
                ? formatHour(selectedHour)
                : "Not selected"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form-content">
          <div className="form-group">
            <label htmlFor="booking-name" className="form-label">
              Your Name *
            </label>
            <input
              ref={nameInputRef}
              id="booking-name"
              type="text"
              placeholder="Enter your full name"
              value={bookingName}
              onChange={handleNameChange}
              className={`form-input ${error ? "error" : ""}`}
              disabled={isLoading}
              required
              aria-describedby={error ? "booking-error" : undefined}
            />
          </div>

          {error && (
            <div id="booking-error" className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-buttons">
            <button
              type="submit"
              className="confirm-button"
              disabled={isLoading || !bookingName.trim()}
            >
              {isLoading ? "Booking..." : "Confirm Booking"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
