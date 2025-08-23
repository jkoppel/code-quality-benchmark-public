import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeSlot from '../TimeSlot';
import { Booking } from '../../../types';

describe('TimeSlot', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render available time slot', () => {
    render(
      <TimeSlot
        time="09:00"
        isSelected={false}
        isInRange={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('09:00')).toBeInTheDocument();
    const timeSlot = screen.getByText('09:00').closest('.time-slot');
    expect(timeSlot).toHaveClass('time-slot', 'available');
  });

  it('should render booked time slot', () => {
    const booking: Booking = {
      id: '123',
      roomName: 'Anaconda',
      date: '2023-12-01',
      startTime: '09:00',
      endTime: '10:00',
      userName: 'John Doe'
    };

    render(
      <TimeSlot
        time="09:00"
        booking={booking}
        isSelected={false}
        isInRange={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    const timeSlot = screen.getByText('09:00').closest('.time-slot');
    expect(timeSlot).toHaveClass('time-slot', 'booked');
  });

  it('should render selected time slot', () => {
    render(
      <TimeSlot
        time="09:00"
        isSelected={true}
        isInRange={false}
        onClick={mockOnClick}
      />
    );

    const timeSlot = screen.getByText('09:00').closest('.time-slot');
    expect(timeSlot).toHaveClass('time-slot', 'available', 'selected');
  });

  it('should render in-range time slot', () => {
    render(
      <TimeSlot
        time="09:00"
        isSelected={false}
        isInRange={true}
        onClick={mockOnClick}
      />
    );

    const timeSlot = screen.getByText('09:00').closest('.time-slot');
    expect(timeSlot).toHaveClass('time-slot', 'available', 'in-range');
  });

  it('should call onClick when clicked', () => {
    render(
      <TimeSlot
        time="09:00"
        isSelected={false}
        isInRange={false}
        onClick={mockOnClick}
      />
    );

    const timeSlot = screen.getByText('09:00').closest('.time-slot');
    fireEvent.click(timeSlot!);
    expect(mockOnClick).toHaveBeenCalledWith('09:00');
  });
});
