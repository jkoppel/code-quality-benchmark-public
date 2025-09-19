# Code Quality Benchmark

A benchmark for evaluating AI coding agents on code quality -- including refactoring skill.

## Overview

This benchmark aims to test coding agents on code quality.

In particular, it aims to test

1. how good coding agents are at *designing software*

as well as

2. how good they are at *refactoring*

### How does it do that?

#### Evaluating code quality

Let's start with just evaluating code quality or software design skills, without thinking about refactoring just yet.

Suppose we want to evaluate a bunch of coding agents.
For each of the agents under evaluation, we task the agent with making a small program before scoring its code quality.

The scoring is where things get subtle: an agent's code quality is scored based on how hard it was for *other* coding agents to build further features on top of that initial effort.

For example, we might start by getting the agent under evaluation to develop a small room-booking app. Then we clone the code base multiple times and get other agents to independently implement the same feature request --- e.g. add speaker and projector reservations to the app. (To be clear, these are independent trials.) The original agent under evaluation is then scored based on how hard it was for these feature-addition agents to extend the original agent's codebase.

More specifically: For each of the *n* independent attempts at adding a feature, if there's a bug in that feature, 0 points. Else, the agent under evaluation gets a number of points based on how few lines needed to be changed.

#### Evaluating refactoring skill

Now suppose we want to evaluate how good a coding agent is at refactoring -- call this a *refactoring agent* for short.

Start with a pre-made program that implements the initial program prompt (recall that in our benchmark, there are two prompts for each benchmark challenge, one for the initial program and another for the featur requests).
Then have the refactoring agent refactor it. And then, just as with code quality, the refactoring agent is evaluated based on how easy it is for other agents to add features to the refactored program.

## Quickstart

The CLI will be improved very soon, but for now: 

## Installation

```bash
npm install
npm run build
```

### If you want to use pre-commit

```bash
# Install pre-commit if you haven't already (one-time global install)
brew install pre-commit  # or pip install --user pre-commit

# Install pre-commit hooks in this repo
pre-commit install
```

## Running the benchmark

`npm run benchmark <folder containing initial and update prompts> <agent runner script>`

`npm run benchmark:existing <folder containing initial and update prompts> <refactored program>`
(where the refactored program was refactored / created elsewhere)

### Testing functionality of benchmark attempts

To test the functionality of an attempt at a benchmark task:

`npm run benchmark:test-functionality <benchmark-path> <program-path> [options]`

Options:
- `-p, --port <number>`: Port to use for the dev server (default: 3000)
- `-t, --max-concurrent-tests <number>`: Max number of test cases to run concurrently (default: 4)

Example:
```bash
LOG_LEVEL=debug npm run benchmark:test-functionality benchmarks/evolvability/todolist-easy /path/to/generated/program
```

This uses Claude Code agents with Playwright MCP to check generated programs against a pre-defined test suite.
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

npm run format
npm run check               # TypeScript type checking
npm run lint                # Biome
npm run check:all           # Run both type checking and linting
npm run fix:all             # Format code and fix linting issues
npm run fix:changed         # Format and fix only files that have changed since `main`
npm run check:command-refs  # Check that references to npm commands in docs, error messages are up to date using a headless Claude Code instance
```

## Pre-commit hooks

Pre-commit runs automatically on `git commit`. To skip: `git commit --no-verify`

### If you need to run pre-commit formatting and checks manually

```bash
pre-commit run --all-files
# Formats code and organizes imports using Biome
```

### For jj users

Jujutsu doesn't support Git hooks. Run pre-commit manually before pushing:
```bash
pre-commit run --all-files
# or make an alias:
alias jjpush='pre-commit run --all-files && jj git push'
```

or use `jj fix` with something like the following config (run `jj config edit --repo`):

```toml
[fix.tools.biome]
command = ["npx", "@biomejs/biome", "check", "--stdin-file-path=$path", "--write"]

patterns = [
	"glob:'**/*.js'",
	"glob:'**/*.ts'",
	"glob:'**/*.tsx'",
	"glob:'**/*.json'",
	"glob:'**/*.html'",
	"glob:'**/*.md'",
	"glob:'**/*.css'",
]
```

## License

MIT
