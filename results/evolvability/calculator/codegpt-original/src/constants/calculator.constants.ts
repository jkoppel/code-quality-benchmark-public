export const CALCULATOR_CONSTANTS = {
  INITIAL_DISPLAY: "0",
  DIVISION_BY_ZERO_ERROR: "Error: Division by zero",
  INVALID_INPUT_ERROR: "Error: Invalid input",
  MAX_DISPLAY_LENGTH: 12,
} as const;

export const BUTTON_CLASSES = {
  CLEAR: "clear",
  OPERATION: "operation",
  EQUALS: "equals",
  ZERO: "zero",
  NUMBER: "number",
} as const;

export const OPERATIONS = {
  ADD: "+",
  SUBTRACT: "-",
  MULTIPLY: "*",
  DIVIDE: "/",
} as const;

export const NUMBERS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;
