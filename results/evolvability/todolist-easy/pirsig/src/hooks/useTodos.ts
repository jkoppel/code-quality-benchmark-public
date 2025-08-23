import { useState } from 'react';
import { Todo, TodoId } from '../types';
import { isValidTodoText, sanitizeTodoText } from '../utils/validation';

// Helper to create a branded TodoId
const createTodoId = (id: number): TodoId => id as TodoId;

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextId, setNextId] = useState(1);

  const addTodo = (text: string) => {
    if (isValidTodoText(text)) {
      const newTodo: Todo = {
        id: createTodoId(nextId),
        text: sanitizeTodoText(text),
        done: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTodos([...todos, newTodo]);
      setNextId(nextId + 1);
      return true;
    }
    return false;
  };

  const toggleDone = (id: TodoId) => {
    setTodos(todos.map(todo =>
      todo.id === id 
        ? { ...todo, done: !todo.done, updatedAt: new Date() } 
        : todo
    ));
  };

  const deleteTodo = (id: TodoId) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTodo = (id: TodoId, newText: string) => {
    setTodos(todos.map(todo =>
      todo.id === id 
        ? { ...todo, text: newText, updatedAt: new Date() } 
        : todo
    ));
  };

  return {
    todos,
    addTodo,
    toggleDone,
    deleteTodo,
    editTodo,
  };
};