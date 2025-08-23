import React, { useState } from 'react';
import Button from './components/Button';
import { TodoItemProps } from './types';
import { UI_TEXT, CSS_CLASSES, KEYS } from './constants';
import './styles/TodoItem.css';

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
    <li className={CSS_CLASSES.TODO_ITEM}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggleDone(todo.id)}
        className={CSS_CLASSES.TODO_CHECKBOX}
      />
      {isEditing ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => e.key === KEYS.ENTER && handleSave()}
            className={CSS_CLASSES.TODO_EDIT_INPUT}
          />
          <Button onClick={handleSave} variant="save">{UI_TEXT.SAVE_BUTTON}</Button>
          <Button onClick={handleCancel} variant="cancel">{UI_TEXT.CANCEL_BUTTON}</Button>
        </>
      ) : (
        <>
          <span
            className={`${CSS_CLASSES.TODO_TEXT} ${todo.done ? CSS_CLASSES.TODO_TEXT_COMPLETED : ''}`}
            onClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
          <Button onClick={() => setIsEditing(true)} variant="edit">{UI_TEXT.EDIT_BUTTON}</Button>
          <Button onClick={() => onDelete(todo.id)} variant="delete">{UI_TEXT.DELETE_BUTTON}</Button>
        </>
      )}
    </li>
  );
};

export default TodoItem;