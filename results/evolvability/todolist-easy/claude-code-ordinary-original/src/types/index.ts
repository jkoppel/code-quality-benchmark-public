export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export interface TodoItemProps {
  todo: Todo;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

export interface TodoListProps {
  todos: Todo[];
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}