export class TestContext {
  constructor(private context: Map<string, unknown>) {}

  get(key: string): unknown {
    return this.context.get(key);
  }

  set(key: string, value: unknown): void {
    this.context.set(key, value);
  }
}
