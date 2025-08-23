import { useState, useCallback } from "react";
import {
  EditState,
  ValidationResult,
  TodoValidationHandler,
} from "../types/Todo";

// Custom hook for managing todo edit state (Single Responsibility)
export const useTodoEdit = (
  initialText: string,
  validator?: TodoValidationHandler
) => {
  const [editState, setEditState] = useState<EditState>({
    isEditing: false,
    editText: initialText,
  });

  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
  });

  const startEditing = useCallback(() => {
    setEditState({
      isEditing: true,
      editText: initialText,
    });
    setValidationResult({ isValid: true });
  }, [initialText]);

  const cancelEditing = useCallback(() => {
    setEditState({
      isEditing: false,
      editText: initialText,
    });
    setValidationResult({ isValid: true });
  }, [initialText]);

  const updateEditText = useCallback(
    (newText: string) => {
      setEditState((prev) => ({
        ...prev,
        editText: newText,
      }));

      // Validate if validator is provided
      if (validator) {
        const result = validator(newText);
        setValidationResult(result);
      }
    },
    [validator]
  );

  const canSave = useCallback(() => {
    return editState.editText.trim().length > 0 && validationResult.isValid;
  }, [editState.editText, validationResult.isValid]);

  return {
    editState,
    validationResult,
    startEditing,
    cancelEditing,
    updateEditText,
    canSave,
  };
};
