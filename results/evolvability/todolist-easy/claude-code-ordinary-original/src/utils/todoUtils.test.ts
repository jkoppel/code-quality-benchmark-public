import {
  createTodo,
  toggleTodoCompletion,
  updateTodoText,
  findTodoById,
  findTodoIndex,
  removeTodo,
  updateTodoById,
  isValidTodoText,
} from './todoUtils';
import { Todo } from '../types';

describe('todoUtils', () => {
  const mockTodos: Todo[] = [
    { id: 1, text: 'First todo', done: false },
    { id: 2, text: 'Second todo', done: true },
    { id: 3, text: 'Third todo', done: false },
  ];

  describe('createTodo', () => {
    test('should create a new todo with trimmed text', () => {
      const todo = createTodo(1, '  New todo  ');
      expect(todo).toEqual({
        id: 1,
        text: 'New todo',
        done: false,
      });
    });
  });

  describe('toggleTodoCompletion', () => {
    test('should toggle done status from false to true', () => {
      const todo: Todo = { id: 1, text: 'Test', done: false };
      const toggled = toggleTodoCompletion(todo);
      expect(toggled.done).toBe(true);
      expect(toggled.id).toBe(1);
      expect(toggled.text).toBe('Test');
    });

    test('should toggle done status from true to false', () => {
      const todo: Todo = { id: 1, text: 'Test', done: true };
      const toggled = toggleTodoCompletion(todo);
      expect(toggled.done).toBe(false);
    });
  });

  describe('updateTodoText', () => {
    test('should update todo text with trimmed value', () => {
      const todo: Todo = { id: 1, text: 'Old text', done: false };
      const updated = updateTodoText(todo, '  New text  ');
      expect(updated.text).toBe('New text');
      expect(updated.id).toBe(1);
      expect(updated.done).toBe(false);
    });
  });

  describe('findTodoById', () => {
    test('should find existing todo by id', () => {
      const found = findTodoById(mockTodos, 2);
      expect(found).toEqual({ id: 2, text: 'Second todo', done: true });
    });

    test('should return undefined for non-existent id', () => {
      const found = findTodoById(mockTodos, 999);
      expect(found).toBeUndefined();
    });
  });

  describe('findTodoIndex', () => {
    test('should find index of existing todo', () => {
      const index = findTodoIndex(mockTodos, 2);
      expect(index).toBe(1);
    });

    test('should return -1 for non-existent id', () => {
      const index = findTodoIndex(mockTodos, 999);
      expect(index).toBe(-1);
    });
  });

  describe('removeTodo', () => {
    test('should remove todo by id', () => {
      const result = removeTodo(mockTodos, 2);
      expect(result).toHaveLength(2);
      expect(result.find(t => t.id === 2)).toBeUndefined();
      expect(result).toEqual([
        { id: 1, text: 'First todo', done: false },
        { id: 3, text: 'Third todo', done: false },
      ]);
    });

    test('should return same array if id not found', () => {
      const result = removeTodo(mockTodos, 999);
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockTodos);
    });
  });

  describe('updateTodoById', () => {
    test('should update todo by id using updater function', () => {
      const updater = (todo: Todo) => ({ ...todo, done: !todo.done });
      const result = updateTodoById(mockTodos, 1, updater);
      
      expect(result[0].done).toBe(true);
      expect(result[1]).toEqual(mockTodos[1]); // unchanged
      expect(result[2]).toEqual(mockTodos[2]); // unchanged
    });

    test('should return same array if id not found', () => {
      const updater = (todo: Todo) => ({ ...todo, done: !todo.done });
      const result = updateTodoById(mockTodos, 999, updater);
      expect(result).toEqual(mockTodos);
    });
  });

  describe('isValidTodoText', () => {
    test('should return true for non-empty trimmed text', () => {
      expect(isValidTodoText('Valid text')).toBe(true);
      expect(isValidTodoText('  Valid text  ')).toBe(true);
    });

    test('should return false for empty or whitespace-only text', () => {
      expect(isValidTodoText('')).toBe(false);
      expect(isValidTodoText('   ')).toBe(false);
      expect(isValidTodoText('\t\n')).toBe(false);
    });
  });
});