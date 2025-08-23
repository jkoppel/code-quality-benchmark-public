import React from 'react';
import { useTodos } from './hooks/useTodos';
import AddTodoForm from './components/AddTodoForm/AddTodoForm';
import TodoList from './components/TodoList/TodoList';
import './App.css';

function App() {
  const { todos, addTodo, toggleTodo, deleteTodo, editTodo } = useTodos();

  return (
    <div className="App">
      <div className="app-container">
        <h1 className="app-title">Todo List</h1>
        <AddTodoForm onAdd={addTodo} />
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
        />
      </div>
    </div>
  );
}

export default App;
