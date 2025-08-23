import React from 'react';
import Button from './Button';
import { useInput } from '../hooks/useInput';
import { UI_TEXT, CSS_CLASSES, KEYS } from '../constants';
import '../styles/TodoInput.css';

interface TodoInputProps {
  onAddTodo: (text: string) => boolean;
  placeholder?: string;
}

const TodoInput: React.FC<TodoInputProps> = ({ 
  onAddTodo, 
  placeholder = UI_TEXT.INPUT_PLACEHOLDER
}) => {
  const inputText = useInput();

  const handleAddTodo = () => {
    if (onAddTodo(inputText.value)) {
      inputText.clear();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYS.ENTER) {
      handleAddTodo();
    }
  };

  return (
    <div className={CSS_CLASSES.INPUT_CONTAINER}>
      <input
        type="text"
        value={inputText.value}
        onChange={inputText.onChange}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        className={CSS_CLASSES.TASK_INPUT}
      />
      <Button onClick={handleAddTodo}>{UI_TEXT.ADD_BUTTON}</Button>
    </div>
  );
};

export default TodoInput;