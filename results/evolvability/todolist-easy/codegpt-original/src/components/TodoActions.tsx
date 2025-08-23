import React from "react";
import { TodoDeleteCommand } from "../types/Todo";

interface TodoActionsProps {
  readonly todoId: number;
  readonly onEdit: () => void;
  readonly onDelete: TodoDeleteCommand;
  readonly disabled?: boolean;
}

// Single Responsibility: Only handles action buttons (Edit, Delete)
export const TodoActions: React.FC<TodoActionsProps> = ({
  todoId,
  onEdit,
  onDelete,
  disabled = false,
}) => {
  const handleDelete = () => {
    if (!disabled) {
      onDelete.execute(todoId);
    }
  };

  const handleEdit = () => {
    if (!disabled) {
      onEdit();
    }
  };

  return (
    <div className="todo-actions">
      <button
        onClick={handleEdit}
        disabled={disabled}
        className="todo-button edit"
        aria-label="Edit todo"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={disabled}
        className="todo-button delete"
        aria-label="Delete todo"
      >
        Delete
      </button>
    </div>
  );
};
