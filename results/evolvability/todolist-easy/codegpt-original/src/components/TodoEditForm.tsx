import React from "react";
import { EditState, ValidationResult } from "../types/Todo";

interface TodoEditFormProps {
  readonly editState: EditState;
  readonly validationResult: ValidationResult;
  readonly onTextChange: (text: string) => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
  readonly canSave: boolean;
}

// Single Responsibility: Only handles the edit form UI and interactions
export const TodoEditForm: React.FC<TodoEditFormProps> = ({
  editState,
  validationResult,
  onTextChange,
  onSave,
  onCancel,
  canSave,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSave) {
      e.preventDefault();
      onSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="todo-edit-form">
      <input
        type="text"
        value={editState.editText}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={handleKeyPress}
        className={`todo-edit-input ${
          !validationResult.isValid ? "error" : ""
        }`}
        autoFocus
        aria-label="Edit todo text"
        aria-invalid={!validationResult.isValid}
        aria-describedby={!validationResult.isValid ? "edit-error" : undefined}
      />

      {!validationResult.isValid && validationResult.errorMessage && (
        <div id="edit-error" className="error-message" role="alert">
          {validationResult.errorMessage}
        </div>
      )}

      <div className="edit-buttons">
        <button
          onClick={onSave}
          disabled={!canSave}
          className="todo-button save"
          aria-label="Save changes"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="todo-button cancel"
          aria-label="Cancel editing"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
