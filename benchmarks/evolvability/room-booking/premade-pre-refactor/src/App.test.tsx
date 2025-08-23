import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders room booking system', () => {
  render(<App />);
  const linkElement = screen.getByText(/Room Booking System/i);
  expect(linkElement).toBeInTheDocument();
});