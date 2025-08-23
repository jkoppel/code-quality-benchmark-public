import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders room booking system', () => {
  render(<App />);
  const linkElement = screen.getByText(/Room Booking System/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders room list and calendar container', () => {
  render(<App />);
  
  // Check that room list is rendered
  expect(screen.getByText(/Rooms/i)).toBeInTheDocument();
  
  // Check that calendar container is rendered with initial message
  expect(screen.getByText(/Please select a room/i)).toBeInTheDocument();
});