import unimplemented from "ts-unimplemented";
import type { z } from "zod";
import { Logger } from "../../utils/logger";
import type { DriverAgent } from "./driver-agent";
import type { TestResult } from "./report";
import type { SutConfig } from "./runner";

/*************************************
  Test Case Agent
***************************************/

export class TestCaseAgent {
  constructor(
    private readonly sutConfig: SutConfig,
    private readonly driver: DriverAgent,
    // TODO: Add a child method to our Logger wrapper...
    private readonly logger: Logger = Logger.getInstance(),
  ) {}

  async check(instructions: string): Promise<TestResult> {
    return unimplemented();
  }

  async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    return unimplemented();
  }
}
