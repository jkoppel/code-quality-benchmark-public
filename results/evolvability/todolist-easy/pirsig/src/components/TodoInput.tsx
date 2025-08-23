import React from 'react';

interface TodoInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ value, onChange, onAdd }) => {
  return (
    <div className="input-container">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        placeholder="Enter a new task"
        className="task-input"
      />
      <button onClick={onAdd} className="add-button">Add Todo</button>
    </div>
  );
};

export default TodoInput;