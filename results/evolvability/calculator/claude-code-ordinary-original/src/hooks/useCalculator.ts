import { useState, useCallback } from 'react';
import { Operation, calculate, formatNumber, isValidOperation } from '../utils/operations';

export interface CalculatorState {
  display: string;
  previousValue: string | null;
  operation: Operation | null;
  waitingForNewValue: boolean;
}

export interface CalculatorActions {
  inputNumber: (num: string) => void;
  inputOperation: (nextOperation: string) => void;
  performCalculation: () => void;
  clear: () => void;
}

export const useCalculator = (): CalculatorState & CalculatorActions => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = useCallback((num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, waitingForNewValue]);

  const inputOperation = useCallback((nextOperation: string) => {
    if (!isValidOperation(nextOperation)) {
      console.warn(`Invalid operation: ${nextOperation}`);
      return;
    }

    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      try {
        const currentValue = parseFloat(previousValue || '0');
        const newValue = calculate(currentValue, inputValue, operation);
        const formattedValue = formatNumber(newValue);
        setDisplay(formattedValue);
        setPreviousValue(formattedValue);
      } catch (error) {
        setDisplay('Error');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
        return;
      }
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const performCalculation = useCallback(() => {
    if (previousValue !== null && operation !== null) {
      try {
        const inputValue = parseFloat(display);
        const prevValue = parseFloat(previousValue);
        const newValue = calculate(prevValue, inputValue, operation);
        const formattedValue = formatNumber(newValue);
        setDisplay(formattedValue);
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
      } catch (error) {
        setDisplay('Error');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
      }
    }
  }, [display, previousValue, operation]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);

  return {
    display,
    previousValue,
    operation,
    waitingForNewValue,
    inputNumber,
    inputOperation,
    performCalculation,
    clear,
  };
};