import { useCallback } from "react";
import { ValidationResult, TodoValidationHandler } from "../types/Todo";

// Validation rules configuration
export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  customValidator?: (text: string) => string | null;
}

// Custom hook for todo text validation (Single Responsibility)
export const useTodoValidation = (
  rules: ValidationRules = {}
): TodoValidationHandler => {
  const {
    minLength = 1,
    maxLength = 500,
    required = true,
    customValidator,
  } = rules;

  return useCallback(
    (text: string): ValidationResult => {
      const trimmedText = text.trim();

      // Required validation
      if (required && trimmedText.length === 0) {
        return {
          isValid: false,
          errorMessage: "Todo text is required",
        };
      }

      // Minimum length validation
      if (trimmedText.length > 0 && trimmedText.length < minLength) {
        return {
          isValid: false,
          errorMessage: `Todo text must be at least ${minLength} characters`,
        };
      }

      // Maximum length validation
      if (trimmedText.length > maxLength) {
        return {
          isValid: false,
          errorMessage: `Todo text must not exceed ${maxLength} characters`,
        };
      }

      // Custom validation
      if (customValidator) {
        const customError = customValidator(trimmedText);
        if (customError) {
          return {
            isValid: false,
            errorMessage: customError,
          };
        }
      }

      return { isValid: true };
    },
    [minLength, maxLength, required, customValidator]
  );
};
