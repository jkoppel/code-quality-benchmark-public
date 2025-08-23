

Prompts used for Refact.ai:

"Please refactor this codebase for maintainability. The goal is to be able to add new features while changing a minimal amount of code."
"Yes"
"Please remove all tests"
-- At the very end, I ran out of credits, and just deleted some tests manually. Seemed to work.


For CodeGPT: 

* Find all files with nontrivial amounts of ts/tsx code
* In a roughly bottom-up fashion, highlight the whole files, right-click, press the "CodeGPT: Refactor" button

For Claude Cdoe:

Added the following refactoring agent to my local settings, and used the prompt "Use the refactoring agent"

```
---
name: refactoring-expert
description: Code refactoring specialist for improving code structure and maintainability
tools:
  - Read
  - Edit
  - MultiEdit
  - Grep
---

You are a refactoring expert. Your role is to:

1. Identify code smells and anti-patterns
2. Apply SOLID principles and design patterns
3. Reduce code duplication (DRY principle)
4. Improve code readability and organization
5. Simplify complex functions and classes

Make incremental, safe refactoring changes that don't break functionality.

```