# Code Quality Benchmark

A benchmark for evaluating AI coding agents on code quality -- including refactoring skill.

## Overview

This benchmark aims to test coding agents on code quality.

In particular, it aims to test

1. how good coding agents are at *designing software*

as well as

2. how good they are at *refactoring*

### How does it do that?

<!-- TODO: Add something about the structure of the benchmark projects / tasks and the underconstrained nature of the specs -->

#### Evaluating code quality

Let's start with just evaluating code quality or software design skills, without thinking about refactoring just yet.

To evaluate a coding agent, we task it with making a small program before scoring its code quality.

The scoring is where things get subtle: an agent's code quality is scored based on how hard it was for *other* coding agents to build further features on top of that initial effort.

For example, we might start by getting the agent under evaluation to develop a small room-booking app. Then we clone the code base multiple times and get other agents to independently implement the same feature request --- e.g. add speaker and projector reservations to the app. (To be clear, these are *independent* trials.) The original agent under evaluation is then scored based on how hard it was for these feature-addition agents to extend the codebase.

More specifically: For each of the independent attempts at adding a feature, if there's a bug in that feature, 0 points. Else, the agent under evaluation gets a number of points based on how few lines needed to be changed.

#### Evaluating refactoring skill

Now suppose we want to evaluate how good a coding agent is at refactoring.

Start with a pre-made program that implements the initial program prompt (recall that in our benchmark, there are two prompts for each benchmark challenge, one for the initial program and another for the feature requests).

Then have the refactoring agent refactor it. 

And then, just as with code quality, the refactoring agent is evaluated based on how easy it is for other agents to add features to the refactored program.

## Quickstart

There will be a better, more streamlined CLI very soon.

But for now, you can run the benchmark by installing with npm, and then running the specific scripts you are interested in.

### Installation

To install the core harness:

```bash
npm install
npm run build
```

You will also need Claude Code if you want to run the functionality tests.

### Running the benchmark

There are three key scripts: two scripts for running the evaluation and scoring it based on the diffs, and a third for running functionality tests for the benchmark tasks.

The benchmark harness and infrastructure will be streamlined and improved in the very near future.

```bash
npm run benchmark <folder containing initial and update prompts> <agent runner script>`
```

```bash
npm run benchmark:existing <folder containing initial and update prompts> <refactored program>
# (where the refactored program was refactored / created elsewhere)
```


### Testing functionality of benchmark attempts

To test the functionality of an attempt at a benchmark task:

```bash
npm run benchmark:test-functionality <benchmark-path> <program-path> [options]
```

Options:
- `-p, --port <number>`: Port to use for the dev server (default: 3000)
- `-t, --max-concurrent-tests <number>`: Max number of test cases to run concurrently (default: 4)

Example:

```bash
LOG_LEVEL=debug npm run benchmark:test-functionality benchmarks/evolvability/todolist-easy /path/to/generated/program
```

This uses Claude Code agents with Playwright MCP to check generated programs against a pre-defined test suite.
The test suite is formulated at a higher level, and partially in natural language, because we intentionally don't impose a lot of constraints on the data representation in the benchmark specs.


## For contributors

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

Jujutsu doesn't support Git hooks. 

For now, either run pre-commit manually before pushing:
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
