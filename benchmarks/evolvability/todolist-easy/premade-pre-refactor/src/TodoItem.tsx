import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleDone, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggleDone(todo.id)}
        className="todo-checkbox"
      />
      {isEditing ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            className="todo-edit-input"
          />
          <button onClick={handleSave} className="todo-button save">Save</button>
          <button onClick={handleCancel} className="todo-button cancel">Cancel</button>
        </>
      ) : (
        <>
          <span
            className={`todo-text ${todo.done ? 'completed' : ''}`}
            onClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
          <button onClick={() => setIsEditing(true)} className="todo-button edit">Edit</button>
          <button onClick={() => onDelete(todo.id)} className="todo-button delete">Delete</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;