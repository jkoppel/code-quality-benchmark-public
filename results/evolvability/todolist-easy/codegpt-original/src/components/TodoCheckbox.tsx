import React from "react";
import { Todo, TodoToggleCommand } from "../types/Todo";

interface TodoCheckboxProps {
  readonly todo: Todo;
  readonly onToggle: TodoToggleCommand;
  readonly disabled?: boolean;
}

// Single Responsibility: Only handles the checkbox for toggling todo completion
export const TodoCheckbox: React.FC<TodoCheckboxProps> = ({
  todo,
  onToggle,
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onToggle.execute(todo.id);
    }
  };

  return (
    <input
      type="checkbox"
      checked={todo.done}
      onChange={handleToggle}
      disabled={disabled}
      className="todo-checkbox"
      aria-label={`Mark "${todo.text}" as ${
        todo.done ? "incomplete" : "complete"
      }`}
    />
  );
};
