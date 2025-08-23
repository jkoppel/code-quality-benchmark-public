import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoInput from './TodoInput';

describe('TodoInput', () => {
  const mockOnAddTodo = jest.fn();

  beforeEach(() => {
    mockOnAddTodo.mockClear();
  });

  test('renders input and button', () => {
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const inputElement = screen.getByPlaceholderText(/enter a new task/i);
    const buttonElement = screen.getByText(/add todo/i);
    
    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders with custom placeholder', () => {
    render(<TodoInput onAddTodo={mockOnAddTodo} placeholder="Custom placeholder" />);
    
    const inputElement = screen.getByPlaceholderText(/custom placeholder/i);
    expect(inputElement).toBeInTheDocument();
  });

  test('calls onAddTodo when button is clicked with text', () => {
    mockOnAddTodo.mockReturnValue(true);
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const inputElement = screen.getByPlaceholderText(/enter a new task/i);
    const buttonElement = screen.getByText(/add todo/i);
    
    fireEvent.change(inputElement, { target: { value: 'New todo' } });
    fireEvent.click(buttonElement);
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('New todo');
  });

  test('calls onAddTodo when Enter key is pressed', () => {
    mockOnAddTodo.mockReturnValue(true);
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const inputElement = screen.getByPlaceholderText(/enter a new task/i);
    
    fireEvent.change(inputElement, { target: { value: 'New todo' } });
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('New todo');
  });

  test('clears input when todo is successfully added', () => {
    mockOnAddTodo.mockReturnValue(true);
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const inputElement = screen.getByPlaceholderText(/enter a new task/i) as HTMLInputElement;
    
    fireEvent.change(inputElement, { target: { value: 'New todo' } });
    expect(inputElement.value).toBe('New todo');
    
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    expect(inputElement.value).toBe('');
  });

  test('does not clear input when todo addition fails', () => {
    mockOnAddTodo.mockReturnValue(false);
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const inputElement = screen.getByPlaceholderText(/enter a new task/i) as HTMLInputElement;
    
    fireEvent.change(inputElement, { target: { value: 'Invalid todo' } });
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    expect(inputElement.value).toBe('Invalid todo');
  });

  test('does not call onAddTodo for non-Enter key presses', () => {
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const inputElement = screen.getByPlaceholderText(/enter a new task/i);
    
    fireEvent.change(inputElement, { target: { value: 'New todo' } });
    fireEvent.keyDown(inputElement, { key: 'Space' });
    fireEvent.keyDown(inputElement, { key: 'Escape' });
    
    expect(mockOnAddTodo).not.toHaveBeenCalled();
  });
});