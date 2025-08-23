import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders calculator display', () => {
  render(<App />);
  const displayElement = document.querySelector('.calculator-display');
  expect(displayElement).toBeInTheDocument();
  expect(displayElement).toHaveTextContent('0');
});

test('renders calculator buttons', () => {
  render(<App />);
  const clearButton = screen.getByText('C');
  const equalsButton = screen.getByText('=');
  const numberButton = screen.getByText('1');
  const operationButton = screen.getByText('+');
  
  expect(clearButton).toBeInTheDocument();
  expect(equalsButton).toBeInTheDocument();
  expect(numberButton).toBeInTheDocument();
  expect(operationButton).toBeInTheDocument();
});
