// Brand type for TodoId to ensure type safety
export type TodoId = number & { readonly brand: unique symbol };

export interface Todo {
  id: TodoId;
  text: string;
  done: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type guard for Todo
export const isTodo = (value: unknown): value is Todo => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'text' in value &&
    'done' in value
  );
};

export interface TodoListProps {
  todos: Todo[];
  onToggleDone: (id: TodoId) => void;
  onDelete: (id: TodoId) => void;
  onEdit: (id: TodoId, newText: string) => void;
}

export interface TodoItemProps {
  todo: Todo;
  onToggleDone: (id: TodoId) => void;
  onDelete: (id: TodoId) => void;
  onEdit: (id: TodoId, newText: string) => void;
}