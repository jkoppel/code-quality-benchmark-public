import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders todo list title', () => {
  render(<App />);
  const titleElement = screen.getByText(/todo list/i);
  expect(titleElement).toBeInTheDocument();
});

test('adds a new todo', async () => {
  render(<App />);
  
  const input = screen.getByPlaceholderText(/enter a new task/i);
  const addButton = screen.getByText(/add todo/i);
  
  await userEvent.type(input, 'Test todo');
  await userEvent.click(addButton);
  
  expect(screen.getByText('Test todo')).toBeInTheDocument();
  expect(input).toHaveValue('');
});

test('toggles todo completion', async () => {
  render(<App />);
  
  // Add a todo first
  const input = screen.getByPlaceholderText(/enter a new task/i);
  await userEvent.type(input, 'Test todo');
  await userEvent.click(screen.getByText(/add todo/i));
  
  // Toggle completion
  const checkbox = screen.getByRole('checkbox');
  await userEvent.click(checkbox);
  
  expect(checkbox).toBeChecked();
  expect(screen.getByText('Test todo')).toHaveClass('completed');
});

test('deletes a todo', async () => {
  render(<App />);
  
  // Add a todo first
  const input = screen.getByPlaceholderText(/enter a new task/i);
  await userEvent.type(input, 'Test todo');
  await userEvent.click(screen.getByText(/add todo/i));
  
  // Delete the todo
  const deleteButton = screen.getByText(/delete/i);
  await userEvent.click(deleteButton);
  
  expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
});

test('edits a todo', async () => {
  render(<App />);
  
  // Add a todo first
  const input = screen.getByPlaceholderText(/enter a new task/i);
  await userEvent.type(input, 'Original todo');
  await userEvent.click(screen.getByText(/add todo/i));
  
  // Start editing
  const editButton = screen.getByText(/edit/i);
  await userEvent.click(editButton);
  
  // Edit the text
  const editInput = screen.getByDisplayValue('Original todo');
  await userEvent.clear(editInput);
  await userEvent.type(editInput, 'Edited todo');
  
  // Save the edit
  const saveButton = screen.getByText(/save/i);
  await userEvent.click(saveButton);
  
  expect(screen.getByText('Edited todo')).toBeInTheDocument();
  expect(screen.queryByText('Original todo')).not.toBeInTheDocument();
});
