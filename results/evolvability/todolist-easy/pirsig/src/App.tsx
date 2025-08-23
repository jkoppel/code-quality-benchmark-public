import React, { useState } from 'react';
import { TodoList, TodoInput } from './components';
import { useTodos } from './hooks';
import { APP_CONSTANTS } from './constants';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const { todos, addTodo, toggleDone, deleteTodo, editTodo } = useTodos();

  const handleAddTodo = () => {
    if (addTodo(inputText)) {
      setInputText('');
    }
  };

  return (
    <div className="App">
      <div className="app-container">
        <h1 className="app-title">{APP_CONSTANTS.TITLE}</h1>
        <TodoInput 
          value={inputText}
          onChange={setInputText}
          onAdd={handleAddTodo}
        />
        <TodoList
          todos={todos}
          onToggleDone={toggleDone}
          onDelete={deleteTodo}
          onEdit={editTodo}
        />
      </div>
    </div>
  );
}

export default App;
