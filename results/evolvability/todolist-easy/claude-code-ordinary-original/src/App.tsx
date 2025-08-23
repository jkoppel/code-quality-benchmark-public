import React from 'react';
import TodoList from './TodoList';
import TodoInput from './components/TodoInput';
import { useTodos } from './hooks/useTodos';
import { UI_TEXT, CSS_CLASSES } from './constants';
import './styles/App.css';

function App() {
  const { todos, addTodo, toggleTodo, deleteTodo, editTodo } = useTodos();

  return (
    <div className={CSS_CLASSES.APP}>
      <div className={CSS_CLASSES.APP_CONTAINER}>
        <h1 className={CSS_CLASSES.APP_TITLE}>{UI_TEXT.APP_TITLE}</h1>
        <TodoInput onAddTodo={addTodo} />
        <TodoList
          todos={todos}
          onToggleDone={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
        />
      </div>
    </div>
  );
}

export default App;
