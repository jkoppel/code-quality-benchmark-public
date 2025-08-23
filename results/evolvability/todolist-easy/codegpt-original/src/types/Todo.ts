// Core Todo entity following Single Responsibility Principle
export interface Todo {
  readonly id: number;
  readonly text: string;
  readonly done: boolean;
}

// Separate interfaces for different concerns (Interface Segregation Principle)
export interface TodoDisplayProps {
  readonly todo: Todo;
}

export interface TodoActionsProps {
  readonly todoId: number;
}

// Command interfaces for actions (Dependency Inversion Principle)
export interface TodoToggleCommand {
  execute(id: number): void;
}

export interface TodoDeleteCommand {
  execute(id: number): void;
}

export interface TodoEditCommand {
  execute(id: number, newText: string): void;
}

// Aggregate interface for all todo operations
export interface TodoOperations {
  onToggleDone: TodoToggleCommand;
  onDelete: TodoDeleteCommand;
  onEdit: TodoEditCommand;
}

// Validation result type
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errorMessage?: string;
}

// Edit state management
export interface EditState {
  readonly isEditing: boolean;
  readonly editText: string;
}

// Event handler types
export type TodoEventHandler<T = void> = (data: T) => void;
export type TodoValidationHandler = (text: string) => ValidationResult;
