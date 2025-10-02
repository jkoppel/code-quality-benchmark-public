export class EvaluationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "EvaluationError";
  }
}
