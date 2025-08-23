export type Operation = '+' | '-' | '*' | '/';

export function applyOperation(
  a: number,
  b: number,
  op: Operation
): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      // guard divide by zero
      return b === 0 ? NaN : a / b;
  }
}
