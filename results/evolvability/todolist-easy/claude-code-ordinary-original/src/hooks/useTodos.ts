import { useState } from 'react';
import { Todo } from '../types';
import { createTodo, toggleTodoCompletion, updateTodoText, removeTodo, updateTodoById, isValidTodoText } from '../utils';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextId, setNextId] = useState(1);

  const addTodo = (text: string) => {
    if (isValidTodoText(text)) {
      setTodos(prevTodos => [...prevTodos, createTodo(nextId, text)]);
      setNextId(prevId => prevId + 1);
      return true;
    }
    return false;
  };

  const toggleTodo = (id: number) => {
    setTodos(prevTodos => updateTodoById(prevTodos, id, toggleTodoCompletion));
  };

  const deleteTodo = (id: number) => {
    setTodos(prevTodos => removeTodo(prevTodos, id));
  };

  const editTodo = (id: number, newText: string) => {
    if (isValidTodoText(newText)) {
      setTodos(prevTodos => 
        updateTodoById(prevTodos, id, todo => updateTodoText(todo, newText))
      );
      return true;
    }
    return false;
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  };
};