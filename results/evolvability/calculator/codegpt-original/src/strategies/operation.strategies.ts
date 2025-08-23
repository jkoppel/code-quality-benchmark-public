import { OperationStrategy, Operation } from "../types/calculator.types";

export class AdditionStrategy implements OperationStrategy {
  execute(a: number, b: number): number {
    return a + b;
  }
}

export class SubtractionStrategy implements OperationStrategy {
  execute(a: number, b: number): number {
    return a - b;
  }
}

export class MultiplicationStrategy implements OperationStrategy {
  execute(a: number, b: number): number {
    return a * b;
  }
}

export class DivisionStrategy implements OperationStrategy {
  execute(a: number, b: number): number {
    if (b === 0) {
      throw new Error("Division by zero");
    }
    return a / b;
  }
}

export class OperationContext {
  private strategies: Map<Operation, OperationStrategy> = new Map([
    ["+", new AdditionStrategy()],
    ["-", new SubtractionStrategy()],
    ["*", new MultiplicationStrategy()],
    ["/", new DivisionStrategy()],
  ]);

  execute(operation: Operation, a: number, b: number): number {
    const strategy = this.strategies.get(operation);
    if (!strategy) {
      throw new Error(`Unsupported operation: ${operation}`);
    }
    return strategy.execute(a, b);
  }
}
