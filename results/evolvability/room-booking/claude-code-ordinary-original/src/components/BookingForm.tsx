import React from 'react';
import { BookingFormProps } from '../types';
import { RESOURCE_TYPES } from '../constants';

const BookingForm: React.FC<BookingFormProps> = ({
  roomName,
  startTime,
  endTime,
  userName,
  selectedResources,
  onUserNameChange,
  onResourcesChange,
  onConfirm,
  onCancel
}) => {
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUserNameChange(event.target.value);
  };

  const handleResourceChange = (resource: string) => {
    const updatedResources = selectedResources.includes(resource)
      ? selectedResources.filter(r => r !== resource)
      : [...selectedResources, resource];
    onResourcesChange(updatedResources);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (userName.trim()) {
      onConfirm();
    }
  };

  return (
    <div className="booking-form">
      <h4>Book {roomName}</h4>
      <p>From {startTime} to {endTime}</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={handleNameChange}
          autoFocus
        />
        
        <div className="resources-section">
          <h5>Additional Resources (2 available each):</h5>
          {RESOURCE_TYPES.map(resource => (
            <label key={resource} className="resource-checkbox">
              <input
                type="checkbox"
                checked={selectedResources.includes(resource)}
                onChange={() => handleResourceChange(resource)}
              />
              {resource}
            </label>
          ))}
        </div>
        
        <div>
          <button 
            type="submit" 
            disabled={!userName.trim()}
          >
            Confirm Booking
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;