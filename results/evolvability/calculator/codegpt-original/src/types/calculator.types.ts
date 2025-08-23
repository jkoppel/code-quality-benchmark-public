export type Operation = "+" | "-" | "*" | "/";

export interface CalculatorState {
  display: string;
  previousValue: string | null;
  operation: Operation | null;
  waitingForNewValue: boolean;
}

export interface CalculationResult {
  result: number;
  error?: string;
}

export interface OperationStrategy {
  execute(a: number, b: number): number;
}

export interface ButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface NumberButtonProps extends ButtonProps {
  number: string;
}

export interface OperationButtonProps extends ButtonProps {
  operation: Operation;
}

export type ButtonType = "number" | "operation" | "clear" | "equals";
