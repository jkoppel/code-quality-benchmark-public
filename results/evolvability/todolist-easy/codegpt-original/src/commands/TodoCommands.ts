import {
  TodoToggleCommand,
  TodoDeleteCommand,
  TodoEditCommand,
} from "../types/Todo";

// Command implementations following the Command Pattern and Dependency Inversion Principle

export class ToggleTodoCommand implements TodoToggleCommand {
  constructor(private readonly toggleHandler: (id: number) => void) {}

  execute(id: number): void {
    this.toggleHandler(id);
  }
}

export class DeleteTodoCommand implements TodoDeleteCommand {
  constructor(private readonly deleteHandler: (id: number) => void) {}

  execute(id: number): void {
    this.deleteHandler(id);
  }
}

export class EditTodoCommand implements TodoEditCommand {
  constructor(
    private readonly editHandler: (id: number, newText: string) => void
  ) {}

  execute(id: number, newText: string): void {
    this.editHandler(id, newText);
  }
}

// Factory function for creating command objects
export const createTodoCommands = (
  onToggleDone: (id: number) => void,
  onDelete: (id: number) => void,
  onEdit: (id: number, newText: string) => void
) => ({
  onToggleDone: new ToggleTodoCommand(onToggleDone),
  onDelete: new DeleteTodoCommand(onDelete),
  onEdit: new EditTodoCommand(onEdit),
});
