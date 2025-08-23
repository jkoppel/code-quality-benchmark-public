// Error handling utilities for robust todo operations

export class TodoError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly todoId?: number
  ) {
    super(message);
    this.name = "TodoError";
  }
}

export const TodoErrorCodes = {
  INVALID_TEXT: "INVALID_TEXT",
  TODO_NOT_FOUND: "TODO_NOT_FOUND",
  OPERATION_FAILED: "OPERATION_FAILED",
} as const;

export type TodoErrorCode =
  (typeof TodoErrorCodes)[keyof typeof TodoErrorCodes];

// Error boundary for todo operations
export const withErrorHandling = <T extends any[], R>(
  operation: (...args: T) => R,
  errorHandler?: (error: Error) => void
) => {
  return (...args: T): R | null => {
    try {
      return operation(...args);
    } catch (error) {
      const todoError =
        error instanceof TodoError
          ? error
          : new TodoError(
              error instanceof Error ? error.message : "Unknown error occurred",
              TodoErrorCodes.OPERATION_FAILED
            );

      if (errorHandler) {
        errorHandler(todoError);
      } else {
        console.error("Todo operation failed:", todoError);
      }

      return null;
    }
  };
};

// Safe operation wrapper for async operations
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const todoError =
      error instanceof TodoError
        ? error
        : new TodoError(
            error instanceof Error
              ? error.message
              : "Unknown async error occurred",
            TodoErrorCodes.OPERATION_FAILED
          );

    if (errorHandler) {
      errorHandler(todoError);
    } else {
      console.error("Async todo operation failed:", todoError);
    }

    return null;
  }
};
