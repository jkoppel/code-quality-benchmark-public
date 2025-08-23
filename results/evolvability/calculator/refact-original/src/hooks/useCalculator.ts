import { useReducer } from 'react';
import { applyOperation, Operation } from '../utils/operations';

export type CalculatorState = {
  display: string;
  previous: string | null;
  operation: Operation | null;
  overwrite: boolean;
};

export type Action =
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'INPUT_DOT' }
  | { type: 'CHOOSE_OP'; operation: Operation }
  | { type: 'EVALUATE' }
  | { type: 'CLEAR' }
  | { type: 'DELETE_DIGIT' };

const initialState: CalculatorState = {
  display: '0',
  previous: null,
  operation: null,
  overwrite: false,
};

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT':
      if (state.overwrite) {
        return { ...state, display: action.digit, overwrite: false };
      }
      // avoid leading zeros
      if (state.display === '0' && action.digit === '0') return state;
      return {
        ...state,
        display:
          state.display === '0' ? action.digit : state.display + action.digit,
      };

    case 'INPUT_DOT':
      if (state.overwrite) {
        return { ...state, display: '0.', overwrite: false };
      }
      if (state.display.includes('.')) return state;
      return { ...state, display: state.display + '.' };

    case 'CHOOSE_OP':
      if (state.display === '') return state;
      if (state.previous === null) {
        return {
          previous: state.display,
          operation: action.operation,
          display: state.display,
          overwrite: true,
        };
      }
      // chain operations
      const result = applyOperation(
        parseFloat(state.previous),
        parseFloat(state.display),
        state.operation!
      );
      return {
        previous: String(result),
        operation: action.operation,
        display: String(result),
        overwrite: true,
      };

    case 'EVALUATE':
      if (state.operation == null || state.previous == null) return state;
      const evalResult = applyOperation(
        parseFloat(state.previous),
        parseFloat(state.display),
        state.operation
      );
      return {
        previous: null,
        operation: null,
        display: String(evalResult),
        overwrite: true,
      };

    case 'CLEAR':
      return initialState;

    case 'DELETE_DIGIT':
      if (state.overwrite) {
        return { ...state, display: '0', overwrite: false };
      }
      if (state.display.length === 1) {
        return { ...state, display: '0' };
      }
      return {
        ...state,
        display: state.display.slice(0, -1),
      };

    default:
      return state;
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
