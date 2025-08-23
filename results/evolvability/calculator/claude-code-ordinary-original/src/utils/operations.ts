export type Operation = '+' | '-' | '*' | '/';

export const isValidOperation = (op: string): op is Operation => {
  return ['+', '-', '*', '/'].includes(op);
};

export const calculate = (firstValue: number, secondValue: number, operation: Operation): number => {
  switch (operation) {
    case '+':
      return firstValue + secondValue;
    case '-':
      return firstValue - secondValue;
    case '*':
      return firstValue * secondValue;
    case '/':
      if (secondValue === 0) {
        throw new Error('Division by zero is not allowed');
      }
      return firstValue / secondValue;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
};

export const formatNumber = (num: number): string => {
  // Handle special cases
  if (!isFinite(num)) {
    return num > 0 ? 'Infinity' : '-Infinity';
  }
  if (isNaN(num)) {
    return 'Error';
  }
  
  // Format the number with reasonable precision
  const formatted = num.toString();
  
  // Handle very large or very small numbers
  if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6);
  }
  
  return formatted;
};