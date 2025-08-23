import React from 'react';
import TodoItem from './TodoItem';
import { Todo, TodoListProps } from '../types';

const TodoList: React.FC<TodoListProps> = ({ todos, onToggleDone, onDelete, onEdit }) => {
  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleDone={onToggleDone}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
};

export default TodoList;