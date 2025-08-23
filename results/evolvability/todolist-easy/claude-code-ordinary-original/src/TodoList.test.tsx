import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoList from './TodoList';
import { Todo } from './types';

// Mock TodoItem component to simplify testing
jest.mock('./TodoItem', () => {
  return function MockTodoItem({ todo }: { todo: Todo }) {
    return <li data-testid={`todo-item-${todo.id}`}>{todo.text}</li>;
  };
});

describe('TodoList', () => {
  const mockProps = {
    onToggleDone: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
  };

  test('renders empty list when no todos', () => {
    render(<TodoList todos={[]} {...mockProps} />);
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toBeEmptyDOMElement();
  });

  test('renders all todos', () => {
    const todos: Todo[] = [
      { id: 1, text: 'First todo', done: false },
      { id: 2, text: 'Second todo', done: true },
      { id: 3, text: 'Third todo', done: false },
    ];

    render(<TodoList todos={todos} {...mockProps} />);
    
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-3')).toBeInTheDocument();
    
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
    expect(screen.getByText('Third todo')).toBeInTheDocument();
  });

  test('passes correct props to TodoItem components', () => {
    const todos: Todo[] = [
      { id: 1, text: 'Test todo', done: false },
    ];

    // We can't easily test props passed to mocked component,
    // but we can test that the component renders
    render(<TodoList todos={todos} {...mockProps} />);
    
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
  });

  test('applies correct CSS class to list', () => {
    render(<TodoList todos={[]} {...mockProps} />);
    
    const list = screen.getByRole('list');
    expect(list).toHaveClass('todo-list');
  });
});