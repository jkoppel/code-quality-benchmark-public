import { Todo } from '../types';

export const createTodo = (id: number, text: string): Todo => ({
  id,
  text: text.trim(),
  done: false,
});

export const toggleTodoCompletion = (todo: Todo): Todo => ({
  ...todo,
  done: !todo.done,
});

export const updateTodoText = (todo: Todo, newText: string): Todo => ({
  ...todo,
  text: newText.trim(),
});

export const findTodoById = (todos: Todo[], id: number): Todo | undefined =>
  todos.find(todo => todo.id === id);

export const findTodoIndex = (todos: Todo[], id: number): number =>
  todos.findIndex(todo => todo.id === id);

export const removeTodo = (todos: Todo[], id: number): Todo[] =>
  todos.filter(todo => todo.id !== id);

export const updateTodoById = (todos: Todo[], id: number, updater: (todo: Todo) => Todo): Todo[] =>
  todos.map(todo => todo.id === id ? updater(todo) : todo);

export const isValidTodoText = (text: string): boolean =>
  text.trim().length > 0;