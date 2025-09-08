export function generateDiverseTaskConfigs(
  availableStatuses: string[],
  availablePriorities: string[],
): string[] {
  const pickDiverse = (options: string[], taskIndex: number): string => {
    if (options.length === 0) return "default";
    if (options.length === 1) return options[0];
    if (options.length === 2) {
      return options[taskIndex % 2];
    }
    const indices = [0, Math.floor(options.length / 2), options.length - 1];
    return options[indices[taskIndex]];
  };

  const dueDates = ["tomorrow", "next week", "yesterday (or past date)"];

  return [0, 1, 2].map((i) => {
    const status = pickDiverse(availableStatuses, i);
    const priorityIndex = 2 - i;
    const priority = pickDiverse(availablePriorities, priorityIndex);

    return `priority: "${priority}", status: "${status}", due: ${dueDates[i]}`;
  });
}
