import { useReducer, useCallback } from 'react';
import { TodosState, TodosAction, Todo } from '../types/todo';

// Simple ID generator for compatibility
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

function todosReducer(state: TodosState, action: TodosAction): TodosState {
  switch (action.type) {
    case 'ADD_TODO': {
      const text = action.payload.text.trim();
      if (!text) return state;
      const newTodo: Todo = { id: generateId(), text, done: false };
      return [...state, newTodo];
    }

    case 'TOGGLE_TODO': {
      return state.map(todo =>
        todo.id === action.payload.id ? { ...todo, done: !todo.done } : todo
      );
    }

    case 'DELETE_TODO': {
      return state.filter(todo => todo.id !== action.payload.id);
    }

    case 'EDIT_TODO': {
      const newText = action.payload.text.trim();
      if (!newText) return state;
      return state.map(todo =>
        todo.id === action.payload.id ? { ...todo, text: newText } : todo
      );
    }

    default:
      return state;
  }
}

export function useTodos(initialTodos: TodosState = []) {
  const [todos, dispatch] = useReducer(todosReducer, initialTodos);

  const addTodo = useCallback((text: string) => 
    dispatch({ type: 'ADD_TODO', payload: { text } }), []);
  
  const toggleTodo = useCallback((id: string) => 
    dispatch({ type: 'TOGGLE_TODO', payload: { id } }), []);
  
  const deleteTodo = useCallback((id: string) => 
    dispatch({ type: 'DELETE_TODO', payload: { id } }), []);
  
  const editTodo = useCallback((id: string, text: string) => 
    dispatch({ type: 'EDIT_TODO', payload: { id, text } }), []);

  return { todos, addTodo, toggleTodo, deleteTodo, editTodo };
}
