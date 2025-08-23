import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders todo list application', () => {
  render(<App />);
  const titleElement = screen.getByText(/todo list/i);
  expect(titleElement).toBeInTheDocument();
  
  const inputElement = screen.getByPlaceholderText(/enter a new task/i);
  expect(inputElement).toBeInTheDocument();
  
  const addButton = screen.getByText(/add todo/i);
  expect(addButton).toBeInTheDocument();
});
