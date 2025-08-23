import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

describe('useTodos', () => {
  test('should initialize with empty todos array', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });

  test('should add a todo when text is valid', () => {
    const { result } = renderHook(() => useTodos());
    
    act(() => {
      const success = result.current.addTodo('Test todo');
      expect(success).toBe(true);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toEqual({
      id: 1,
      text: 'Test todo',
      done: false,
    });
  });

  test('should not add a todo when text is empty or whitespace', () => {
    const { result } = renderHook(() => useTodos());
    
    act(() => {
      const success1 = result.current.addTodo('');
      const success2 = result.current.addTodo('   ');
      expect(success1).toBe(false);
      expect(success2).toBe(false);
    });

    expect(result.current.todos).toHaveLength(0);
  });

  test('should toggle todo completion status', () => {
    const { result } = renderHook(() => useTodos());
    
    act(() => {
      result.current.addTodo('Test todo');
    });

    expect(result.current.todos[0].done).toBe(false);

    act(() => {
      result.current.toggleTodo(1);
    });

    expect(result.current.todos[0].done).toBe(true);

    act(() => {
      result.current.toggleTodo(1);
    });

    expect(result.current.todos[0].done).toBe(false);
  });

  test('should delete a todo', () => {
    const { result } = renderHook(() => useTodos());
    
    act(() => {
      result.current.addTodo('Test todo 1');
    });
    
    act(() => {
      result.current.addTodo('Test todo 2');
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[0].id).toBe(1);
    expect(result.current.todos[1].id).toBe(2);

    act(() => {
      result.current.deleteTodo(1);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe(2);
    expect(result.current.todos[0].text).toBe('Test todo 2');
  });

  test('should edit a todo when text is valid', () => {
    const { result } = renderHook(() => useTodos());
    
    act(() => {
      result.current.addTodo('Original text');
    });

    act(() => {
      const success = result.current.editTodo(1, 'Updated text');
      expect(success).toBe(true);
    });

    expect(result.current.todos[0].text).toBe('Updated text');
  });

  test('should not edit a todo when text is empty or whitespace', () => {
    const { result } = renderHook(() => useTodos());
    
    act(() => {
      result.current.addTodo('Original text');
    });

    act(() => {
      const success1 = result.current.editTodo(1, '');
      const success2 = result.current.editTodo(1, '   ');
      expect(success1).toBe(false);
      expect(success2).toBe(false);
    });

    expect(result.current.todos[0].text).toBe('Original text');
  });

  test('should assign incrementing IDs to new todos', () => {
    const { result } = renderHook(() => useTodos());
    
    act(() => {
      result.current.addTodo('Todo 1');
    });
    
    act(() => {
      result.current.addTodo('Todo 2');
    });
    
    act(() => {
      result.current.addTodo('Todo 3');
    });

    expect(result.current.todos[0].id).toBe(1);
    expect(result.current.todos[1].id).toBe(2);
    expect(result.current.todos[2].id).toBe(3);
  });
});