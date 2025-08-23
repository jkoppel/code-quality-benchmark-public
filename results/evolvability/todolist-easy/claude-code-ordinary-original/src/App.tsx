import React, { useState } from 'react';
import TodoList from './TodoList';
import './App.css';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [nextId, setNextId] = useState(1);

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([...todos, { id: nextId, text: inputText, done: false }]);
      setNextId(nextId + 1);
      setInputText('');
    }
  };

  const toggleDone = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTodo = (id: number, newText: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };

  return (
    <div className="App">
      <div className="app-container">
        <h1 className="app-title">Todo List</h1>
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Enter a new task"
            className="task-input"
          />
          <button onClick={addTodo} className="add-button">Add Todo</button>
        </div>
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
