export const isValidTodoText = (text: string): boolean => {
  return text.trim().length > 0;
};

export const sanitizeTodoText = (text: string): string => {
  return text.trim();
};