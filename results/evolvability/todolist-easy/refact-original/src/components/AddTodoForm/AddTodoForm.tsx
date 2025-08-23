import React, { useState, KeyboardEvent } from 'react';
import './AddTodoForm.css';

interface AddTodoFormProps {
  onAdd: (text: string) => void;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter a new task"
        className="task-input"
      />
      <button onClick={handleAdd} className="add-button">
        Add Todo
      </button>
    </div>
  );
};

export default AddTodoForm;
