import { useState, useCallback } from "react";
import { CalculatorState, Operation } from "../types/calculator.types";
import { CalculatorService } from "../services/calculator.service";

export const useCalculator = () => {
  const calculatorService = new CalculatorService();
  const [state, setState] = useState<CalculatorState>(() =>
    calculatorService.getInitialState()
  );

  const inputNumber = useCallback(
    (number: string) => {
      setState((currentState) =>
        calculatorService.processNumberInput(currentState, number)
      );
    },
    [calculatorService]
  );

  const inputOperation = useCallback(
    (operation: Operation) => {
      setState((currentState) =>
        calculatorService.processOperationInput(currentState, operation)
      );
    },
    [calculatorService]
  );

  const performCalculation = useCallback(() => {
    setState((currentState) => calculatorService.processEquals(currentState));
  }, [calculatorService]);

  const clear = useCallback(() => {
    setState(calculatorService.processClear());
  }, [calculatorService]);

  return {
    display: state.display,
    inputNumber,
    inputOperation,
    performCalculation,
    clear,
  };
};
