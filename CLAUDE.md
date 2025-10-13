# Claude Code Collaboration Guidelines

This document outlines the collaboration guidelines between the developer and Claude Code for this project.

## Project Context

This is a **single developer + AI** collaborative project building the World Heritage Explorer application.

## Core Principles

### 1. Simplicity First

Given the single-developer nature of this project, we prioritize simplicity over complexity:

- Choose straightforward solutions over elaborate architectures
- Avoid over-engineering
- Keep dependencies minimal and purposeful
- Favor maintainability and ease of understanding

### 2. Best Practices & Modern Stack

- Follow industry best practices for code quality and architecture
- Use the **latest stable versions** of third-party libraries
- Exception: Avoid versions with breaking changes unless necessary
- Stay up-to-date with Next.js, React, and TypeScript ecosystem standards

### 3. TypeScript First

- **Always use TypeScript** over JavaScript
- Provide proper type definitions
- Avoid `any` types unless absolutely necessary
- Leverage TypeScript's type safety features

## Git Workflow

### Branch Naming Convention

Follow standard Git flow naming conventions:

- `feat/[description]` - New features
- `fix/[description]` - Bug fixes
- `doc/[description]` - Documentation updates
- `chore/[description]` - Maintenance tasks, deps updates, etc.

Examples:

- `feat/add-map-integration`
- `fix/locale-detection-issue`
- `doc/update-api-documentation`
- `chore/upgrade-dependencies`

### Commit Messages

- Use conventional commit format
- Be descriptive and concise
- Include context in the commit body when needed

## Decision Making

### Bug Fixes & Problem Resolution

**Non-obvious issues:**

- Must discuss and reach consensus before fixing
- Explain the problem and proposed solution
- Wait for approval before implementing

**Obvious errors (can fix directly with explanation):**

- Compilation errors
- TypeScript type errors
- Runtime crashes
- Syntax errors
- Linting errors

### Documentation

**Requires consensus:**

- Creating new standalone documentation files (`.md` files)
- Major documentation restructuring

**Allowed without explicit approval:**

- Code comments and inline documentation
- JSDoc/TSDoc function documentation
- Updates to existing documentation files
- Standard project files (README.md, CHANGELOG.md, package.json, etc.)

## Communication Style

- Be concise and direct
- Focus on technical accuracy
- Ask clarifying questions when requirements are ambiguous
- Provide options when multiple valid approaches exist
- Explain trade-offs when making technical decisions

## Code Quality

- Write clean, readable, and maintainable code
- Follow the existing code style in the project
- Use meaningful variable and function names
- Keep functions focused and small
- Add comments for complex logic
- Ensure all code passes linting and type checking

## Testing

- Consider testability when implementing features
- Add tests for critical business logic
- Document test coverage gaps when relevant

---

**Last Updated:** 2025-01-13
