import { useState, useEffect, useCallback, useMemo } from "react";
import { CalculatorState, Operation } from "../types/calculator.types";
import { CalculatorService } from "../services/CalculatorService";

export const useCalculator = () => {
  const calculatorService = useMemo(() => new CalculatorService(), []);
  const [state, setState] = useState<CalculatorState>(
    calculatorService.getState()
  );

  useEffect(() => {
    const unsubscribe = calculatorService.subscribe(setState);
    return unsubscribe;
  }, [calculatorService]);

  const inputNumber = useCallback(
    (num: string) => {
      try {
        calculatorService.inputNumber(num);
      } catch (error) {
        console.error("Input number error:", error);
      }
    },
    [calculatorService]
  );

  const inputOperation = useCallback(
    (operation: Operation) => {
      try {
        calculatorService.inputOperation(operation);
      } catch (error) {
        console.error("Input operation error:", error);
      }
    },
    [calculatorService]
  );

  const calculate = useCallback(() => {
    try {
      calculatorService.calculate();
    } catch (error) {
      console.error("Calculate error:", error);
    }
  }, [calculatorService]);

  const clear = useCallback(() => {
    calculatorService.clear();
  }, [calculatorService]);

  const backspace = useCallback(() => {
    calculatorService.backspace();
  }, [calculatorService]);

  const toggleSign = useCallback(() => {
    calculatorService.toggleSign();
  }, [calculatorService]);

  return {
    state,
    inputNumber,
    inputOperation,
    calculate,
    clear,
    backspace,
    toggleSign,
  };
};
