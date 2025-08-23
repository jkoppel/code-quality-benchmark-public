import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  test('renders button with children text', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText(/click me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('applies primary variant class by default', () => {
    render(<Button>Primary Button</Button>);
    const buttonElement = screen.getByText(/primary button/i);
    expect(buttonElement).toHaveClass('add-button');
  });

  test('applies correct variant classes', () => {
    const variants = ['edit', 'delete', 'save', 'cancel'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant} Button</Button>);
      const buttonElement = screen.getByText(new RegExp(`${variant} button`, 'i'));
      expect(buttonElement).toHaveClass('todo-button', variant);
      unmount();
    });
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const buttonElement = screen.getByText(/click me/i);
    
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('passes through additional props', () => {
    render(<Button disabled data-testid="test-button">Disabled Button</Button>);
    const buttonElement = screen.getByTestId('test-button');
    expect(buttonElement).toBeDisabled();
  });

  test('combines custom className with variant class', () => {
    render(<Button variant="edit" className="custom-class">Edit Button</Button>);
    const buttonElement = screen.getByText(/edit button/i);
    expect(buttonElement).toHaveClass('todo-button', 'edit', 'custom-class');
  });
});