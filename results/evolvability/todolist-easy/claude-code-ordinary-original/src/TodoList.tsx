import React from 'react';
import TodoItem from './TodoItem';
import { TodoListProps } from './types';
import { CSS_CLASSES } from './constants';
import './styles/TodoList.css';

const TodoList: React.FC<TodoListProps> = ({ todos, onToggleDone, onDelete, onEdit }) => {
  return (
    <ul className={CSS_CLASSES.TODO_LIST}>
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