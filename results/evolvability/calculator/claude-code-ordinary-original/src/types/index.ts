// Re-export types from utils and components for centralized access
export type { Operation } from '../utils/operations';
export type { ButtonType, ButtonProps } from '../components/Button';
export type { DisplayProps } from '../components/Display';
export type { ButtonPanelProps } from '../components/ButtonPanel';
export type { CalculatorState, CalculatorActions } from '../hooks/useCalculator';

// Additional shared types
export interface CalculatorProps {
  className?: string;
  onCalculation?: (result: string) => void;
}

export type Theme = 'dark' | 'light';

export interface CalculatorTheme {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  operationColor: string;
  clearColor: string;
  equalsColor: string;
}