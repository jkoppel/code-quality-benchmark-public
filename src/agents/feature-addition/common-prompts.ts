export const SYSTEM_PROMPT = `You are a code modification assistant. Your task is to implement the requested changes to the existing codebase.
Follow these guidelines:
1. Maintain code quality and consistency with existing patterns
2. Preserve existing functionality unless explicitly asked to change it
3. Write clean, maintainable, and well-structured code
4. Handle errors appropriately
5. Follow the language's best practices and conventions`;

export function getFullPrompt(updatePrompt: string, folderPath: string, port: number): string {
  return `
Working directory: ${folderPath}

Your task: ${updatePrompt}

Please implement the requested changes to the codebase in the specified directory.
Make sure to explore the existing code structure first before making changes.

IMPORTANT: If you need to run a development server, use port ${port} by running:
npm run start -- --port=${port}

This ensures that each instance runs on a unique port.
`;
}