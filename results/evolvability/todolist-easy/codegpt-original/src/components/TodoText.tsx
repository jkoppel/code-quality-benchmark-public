import React from "react";
import { Todo } from "../types/Todo";

interface TodoTextProps {
  readonly todo: Todo;
  readonly onClick?: () => void;
  readonly className?: string;
}

// Single Responsibility: Only handles displaying todo text
export const TodoText: React.FC<TodoTextProps> = ({
  todo,
  onClick,
  className = "",
}) => {
  const textClasses = ["todo-text", todo.done ? "completed" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={textClasses}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? `Click to edit "${todo.text}"` : undefined}
    >
      {todo.text}
    </span>
  );
};
