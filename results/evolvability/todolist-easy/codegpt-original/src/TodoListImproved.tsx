import React, { useCallback } from "react";
import { Todo } from "./types/Todo";
import { TodoItemImproved } from "./components";
import { createTodoCommands } from "./commands/TodoCommands";

interface TodoListImprovedProps {
  todos: Todo[];
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
  onError?: (error: Error) => void;
}

const TodoListImproved: React.FC<TodoListImprovedProps> = ({
  todos,
  onToggleDone,
  onDelete,
  onEdit,
  onError,
}) => {
  // Create command objects following Dependency Inversion Principle
  const operations = useCallback(
    () => createTodoCommands(onToggleDone, onDelete, onEdit),
    [onToggleDone, onDelete, onEdit]
  );

  const handleError = useCallback(
    (error: Error) => {
      console.error("Todo operation failed:", error);
      if (onError) {
        onError(error);
      }
    },
    [onError]
  );

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItemImproved
          key={todo.id}
          todo={todo}
          operations={operations()}
          onError={handleError}
        />
      ))}
    </ul>
  );
};

export default TodoListImproved;
