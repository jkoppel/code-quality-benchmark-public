import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from './TodoItem';
import { Todo } from './types';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: 1,
    text: 'Test todo',
    done: false,
  };

  const mockCompletedTodo: Todo = {
    id: 2,
    text: 'Completed todo',
    done: true,
  };

  const mockProps = {
    onToggleDone: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders todo item in display mode', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    expect(screen.getByText(/test todo/i)).toBeInTheDocument();
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  test('renders completed todo with correct styling', () => {
    render(<TodoItem todo={mockCompletedTodo} {...mockProps} />);
    
    const todoText = screen.getByText(/completed todo/i);
    expect(todoText).toHaveClass('completed');
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('calls onToggleDone when checkbox is clicked', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockProps.onToggleDone).toHaveBeenCalledWith(1);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    const deleteButton = screen.getByText(/delete/i);
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(1);
  });

  test('enters edit mode when edit button is clicked', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    const editButton = screen.getByText(/edit/i);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue(/test todo/i)).toBeInTheDocument();
    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
  });

  test('enters edit mode when todo text is clicked', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    const todoText = screen.getByText(/test todo/i);
    fireEvent.click(todoText);
    
    expect(screen.getByDisplayValue(/test todo/i)).toBeInTheDocument();
    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  test('saves edited todo when save button is clicked', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    // Enter edit mode
    const editButton = screen.getByText(/edit/i);
    fireEvent.click(editButton);
    
    // Edit the text
    const input = screen.getByDisplayValue(/test todo/i);
    fireEvent.change(input, { target: { value: 'Updated todo' } });
    
    // Save
    const saveButton = screen.getByText(/save/i);
    fireEvent.click(saveButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(1, 'Updated todo');
  });

  test('saves edited todo when Enter key is pressed', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    // Enter edit mode
    const editButton = screen.getByText(/edit/i);
    fireEvent.click(editButton);
    
    // Edit the text and press Enter
    const input = screen.getByDisplayValue(/test todo/i);
    fireEvent.change(input, { target: { value: 'Updated todo' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(1, 'Updated todo');
  });

  test('does not save when edit text is empty', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    // Enter edit mode
    const editButton = screen.getByText(/edit/i);
    fireEvent.click(editButton);
    
    // Clear the text
    const input = screen.getByDisplayValue(/test todo/i);
    fireEvent.change(input, { target: { value: '' } });
    
    // Try to save
    const saveButton = screen.getByText(/save/i);
    fireEvent.click(saveButton);
    
    expect(mockProps.onEdit).not.toHaveBeenCalled();
    // Should still be in edit mode
    expect(screen.getByText(/save/i)).toBeInTheDocument();
  });

  test('cancels editing and resets text', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />);
    
    // Enter edit mode
    const editButton = screen.getByText(/edit/i);
    fireEvent.click(editButton);
    
    // Change the text
    const input = screen.getByDisplayValue(/test todo/i);
    fireEvent.change(input, { target: { value: 'Changed text' } });
    
    // Cancel
    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    
    expect(mockProps.onEdit).not.toHaveBeenCalled();
    // Should be back in display mode with original text
    expect(screen.getByText(/test todo/i)).toBeInTheDocument();
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });
});