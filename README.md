# Code Quality Benchmark

A TypeScript library for evaluating AI coding agents on code quality by testing their ability to consistently apply updates to existing codebases.

## Overview

This library provides a framework for:

1. Creating an initial program using a coding agent
2. Creating multiple copies of that program
3. Using Claude Code SDK to apply updates to each copy
4. Comparing the results to evaluate consistency and quality

## Installation

```bash
npm install
npm run build
```

## Running the benchmark

`npm run benchmark <folder containing initial and update prompts> <agent runner script>`

`npm run benchmark:existing <folder containing initial and update prompts> <refactored program>`
(where the refactored program was refactored / created elsewhere)

### Testing functionality of benchmark attempts

To test the functionality of an attempt at a benchmark task:

`npm run benchmark:test-functionality <benchmark-path> <program-path>`

Example:
```bash
LOG_LEVEL=debug npm run benchmark:test-functionality benchmarks/evolvability/todolist-easy /path/to/generated/program
```

This uses Claude Code agents with Playwright MCP to check that generated programs against a pre-defined test suite.
The test suite is formulated at a higher level, and partially in natural language, because we intentionally don't impose a lot of constraints on the data representation in the benchmark specs.

## Core API

### `eval(initialPrompt, codingAgent, updatePrompt, config?)`

The main evaluation function that orchestrates the benchmark process.

#### Parameters:

- `initialPrompt`: String describing the program to create
- `codingAgent`: Function that generates code based on a prompt
- `updatePrompt`: String describing the updates to apply
- `config`: Optional configuration object

#### Returns:

An `EvaluationResult` object containing:

- Original program path
- Results from each update instance
- Execution metadata

## Example Usage

### Using Shell Script Agent

```typescript
import { eval, createShellAgent } from "code-quality-benchmark";

// Create a coding agent from a shell script
const codingAgent = createShellAgent("./my-coding-script.sh");

const result = await eval("Create a calculator app", codingAgent, "Add error handling and validation", {
  logLevel: "debug",
  cleanupAfterRun: false,
});
```

### Shell Script Interface

The shell script receives:

- **Arguments**: `$1` = prompt, `$2` = folder path
- **Environment Variables**: `CODING_PROMPT`, `CODING_FOLDER`

Example shell script:

```bash
#!/bin/bash
PROMPT="$1"
FOLDER="$2"

# Generate code in $FOLDER based on $PROMPT
echo "Generating code for: $PROMPT"
# ... your code generation logic here ...
```

## Architecture

### Key Components

- **Evaluator**: Core orchestration logic with parallel execution
- **Shell Agent**: Executes shell scripts as coding agents
- **Claude Agent**: Wrapper for Claude Code SDK for updates
- **Logger**: Pino-based structured logging
- **Types**: TypeScript interfaces and error classes

### Design Principles

1. **Modularity**: Clean separation of concerns with distinct modules
2. **Robustness**: Comprehensive error handling and validation
3. **Extensibility**: Easy to add new agents and evaluation strategies
4. **Type Safety**: Full TypeScript with strict mode enabled

## Configuration Options

- `timeout`: Maximum execution time in ms
- `cleanupAfterRun`: Auto-cleanup workspace after completion
- `logLevel`: Logging verbosity (`debug`, `info`, `warn`, `error`)
- `claudeConfig`: Claude-specific configuration for updates

## Running the Example

```bash
npm run test
```

This runs the example script that demonstrates creating a calculator program and applying enhancements to it.

## Development

```bash
npm run dev                 # Watch mode for development
npm run build               # Build the project
npm run clean               # Clean build artifacts

npm run check               # TypeScript type checking
npm run lint                # ESLint code linting
npm run check:all           # Run both type checking and linting
npm run check:command-refs  # Check that references to npm commands in docs, error messages are up to date using a headless Claude Code instance
```

## License

MIT
