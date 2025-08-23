import React, { useState } from 'react';
import { BookingFormData } from '../../types/booking';
import { ValidationService } from '../../services/ValidationService';

interface BookingFormProps {
  roomName: string;
  startTime: string;
  endTime: string;
  onConfirm: (formData: BookingFormData) => void;
  onCancel: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  roomName,
  startTime,
  endTime,
  onConfirm,
  onCancel
}) => {
  const [userName, setUserName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const validation = ValidationService.validateBookingForm({ userName });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onConfirm({ userName: userName.trim() });
  };

  const handleUserNameChange = (value: string) => {
    setUserName(value);
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className=\"booking-form\">
      <h4>Book {roomName}</h4>
      <p>From {startTime} to {endTime}</p>
      
      {errors.length > 0 && (
        <div className=\"error-messages\">
          {errors.map((error, index) => (
            <div key={index} className=\"error-message\">{error}</div>
          ))}
        </div>
      )}
      
      <input
        type=\"text\"
        placeholder=\"Your name\"
        value={userName}
        onChange={(e) => handleUserNameChange(e.target.value)}
        className={errors.length > 0 ? 'error' : ''}
      />
      
      <div className=\"form-actions\">
        <button 
          onClick={handleSubmit} 
          disabled={!userName.trim()}
          className=\"confirm-button\"
        >
          Confirm Booking
        </button>
        <button 
          onClick={onCancel}
          className=\"cancel-button\"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};