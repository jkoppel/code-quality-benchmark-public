export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export type TodosState = Todo[];

export type TodosAction =
  | { type: 'ADD_TODO'; payload: { text: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'EDIT_TODO'; payload: { id: string; text: string } };
