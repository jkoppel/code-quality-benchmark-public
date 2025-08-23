import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Todo } from '../../types/todo';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus and select text when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="todo-checkbox"
      />
      {isEditing ? (
        <>
          <input
            ref={editInputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="todo-edit-input"
          />
          <button onClick={handleSave} className="todo-button save">
            Save
          </button>
          <button onClick={handleCancel} className="todo-button cancel">
            Cancel
          </button>
        </>
      ) : (
        <>
          <span
            className={`todo-text ${todo.done ? 'completed' : ''}`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
          <button onClick={() => setIsEditing(true)} className="todo-button edit">
            Edit
          </button>
          <button onClick={() => onDelete(todo.id)} className="todo-button delete">
            Delete
          </button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
