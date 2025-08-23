import React, { useCallback } from "react";
import { Todo, TodoOperations } from "../types/Todo";
import { useTodoEdit } from "../hooks/useTodoEdit";
import { useTodoValidation } from "../hooks/useTodoValidation";
import { TodoCheckbox } from "./TodoCheckbox";
import { TodoText } from "./TodoText";
import { TodoEditForm } from "./TodoEditForm";
import { TodoActions } from "./TodoActions";
import {
  withErrorHandling,
  TodoError,
  TodoErrorCodes,
} from "../utils/errorHandling";

interface TodoItemImprovedProps {
  readonly todo: Todo;
  readonly operations: TodoOperations;
  readonly onError?: (error: Error) => void;
}

/**
 * Improved TodoItem component following SOLID principles:
 *
 * S - Single Responsibility: Each component has one clear purpose
 * O - Open/Closed: Extensible through props and composition, closed for modification
 * L - Liskov Substitution: Can be replaced with any component implementing the same interface
 * I - Interface Segregation: Uses focused interfaces for different concerns
 * D - Dependency Inversion: Depends on abstractions (interfaces) not concrete implementations
 */
export const TodoItemImproved: React.FC<TodoItemImprovedProps> = ({
  todo,
  operations,
  onError,
}) => {
  // Custom validation rules
  const validator = useTodoValidation({
    minLength: 1,
    maxLength: 200,
    required: true,
    customValidator: (text) => {
      if (text.trim().toLowerCase() === "test") {
        return 'Todo cannot be just "test"';
      }
      return null;
    },
  });

  // Edit state management
  const {
    editState,
    validationResult,
    startEditing,
    cancelEditing,
    updateEditText,
    canSave,
  } = useTodoEdit(todo.text, validator);

  // Safe operation handlers with error handling
  const handleSave = useCallback(() => {
    const safeEdit = withErrorHandling((id: number, text: string) => {
      if (!text.trim()) {
        throw new TodoError(
          "Todo text cannot be empty",
          TodoErrorCodes.INVALID_TEXT,
          id
        );
      }
      operations.onEdit.execute(id, text);
    }, onError);

    if (canSave()) {
      const result = safeEdit(todo.id, editState.editText.trim());
      if (result !== null) {
        cancelEditing();
      }
    }
  }, [
    todo.id,
    editState.editText,
    canSave,
    operations.onEdit,
    cancelEditing,
    onError,
  ]);

  const handleToggle = useCallback(() => {
    const safeToggle = withErrorHandling(
      (id: number) => operations.onToggleDone.execute(id),
      onError
    );
    safeToggle(todo.id);
  }, [todo.id, operations.onToggleDone, onError]);

  const handleDelete = useCallback(() => {
    const safeDelete = withErrorHandling(
      (id: number) => operations.onDelete.execute(id),
      onError
    );
    safeDelete(todo.id);
  }, [todo.id, operations.onDelete, onError]);

  return (
    <li className="todo-item" data-testid={`todo-item-${todo.id}`}>
      <TodoCheckbox
        todo={todo}
        onToggle={{ execute: handleToggle }}
        disabled={editState.isEditing}
      />

      {editState.isEditing ? (
        <TodoEditForm
          editState={editState}
          validationResult={validationResult}
          onTextChange={updateEditText}
          onSave={handleSave}
          onCancel={cancelEditing}
          canSave={canSave()}
        />
      ) : (
        <>
          <TodoText todo={todo} onClick={startEditing} className="clickable" />
          <TodoActions
            todoId={todo.id}
            onEdit={startEditing}
            onDelete={{ execute: handleDelete }}
          />
        </>
      )}
    </li>
  );
};
