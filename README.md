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

### Installation

```bash
npm install
npm run build
npm link # to make the cqb benchmark cli available globally
```

You will also need Claude Code if you want to run the functionality tests.

### Basic Usage

```bash
# Generate a program for the benchmark project with the supplied coding agent
# and then apply feature requests and evaluate it
cqb run <benchmark-path> <agent-script-path>

# Run benchmark with existing/refactored code
cqb existing <benchmark-path> <existing-code-path>

# Test functionality of a benchmark attempt (that satisfies not only the initial but also the update prompt)
cqb test <benchmark-path> <system-under-test> [options]
# List functionality test strategies discovered by the harness (debugging aid)
cqb debug:list-tests
```

### CLI Help

```bash
cqb --help                    # Show all commands
cqb run --help                # Show specific command help
cqb --wizard                  # Interactive command builder
```

### Test Command Options

The `cqb test` command supports additional options:
- `-p, --port <number>`: Port to use for the dev server (default: 3000)
- `-t, --max-concurrent-tests <number>`: Max number of test cases to run concurrently (default: 4)
- `--headed`: Run browser in headed mode (show browser window)
- `--playwright-out-dir <path>`: Directory for Playwright MCP traces and sessions

Example:
```bash
LOG_LEVEL=debug cqb test benchmarks/evolvability/todolist-easy /path/to/generated/program
```

### Shell Completion

To enable tab completion for your shell:

```bash
# Bash (add to ~/.bashrc)
echo 'source <(cqb --completions bash)' >> ~/.bashrc

# Zsh (add to ~/.zshrc)
echo 'source <(cqb --completions zsh)' >> ~/.zshrc

# Fish
cqb --completions fish > ~/.config/fish/completions/cqb.fish
```

### Wizard Mode

The CLI also allows you to build commands step-by-step, interactively, with the wizard mode:

```bash
cqb --wizard
```

## Testing Framework

Functionality tests use Claude Code agents with Playwright MCP to check generated programs against pre-defined test suites. The test suites are formulated at a higher level and partially in natural language, because we intentionally don't impose many constraints on data representation in the benchmark specs.


## For contributors

### Development Scripts

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

### Development Setup

For contributors working on the CLI:

1. Install and link for development:
   ```bash
   npm install
   npm run build
   npm link        # Makes 'cqb' available globally
   ```

2. Start watch mode:
   ```bash
   npm run dev     # Rebuilds on file changes
   ```

3. Test your changes:
   ```bash
   cqb run benchmarks/...   # Uses your local development version
   ```

Alternative: Use `npx cqb` to test the local version without global linking.

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
