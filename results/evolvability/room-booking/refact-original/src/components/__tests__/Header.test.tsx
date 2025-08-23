import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('should render the room booking system title', () => {
    render(<Header />);
    
    const titleElement = screen.getByText(/Room Booking System/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('should have correct header structure', () => {
    render(<Header />);
    
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toHaveClass('App-header');
  });
});
