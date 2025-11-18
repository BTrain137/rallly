<!--
Sync Impact Report:
Version: 1.0.0 (initial creation)
Ratified: 2025-11-17
Last Amended: 2025-11-17

Principles Added:
- I. Code Clarity and Readability
- II. Simplicity First
- III. Comprehensive Documentation
- IV. Beginner-Friendly Approach
- V. Minimal File Structure

Sections Added:
- Development Workflow (code review and documentation requirements)

Templates Status:
✅ plan-template.md - Updated Constitution Check section with specific principle checks
✅ spec-template.md - No changes needed (already focuses on clarity)
✅ tasks-template.md - No changes needed (structure already supports simplicity)
⚠️ No command files found in .specify/templates/commands/ - may need manual review if added later

Follow-up TODOs:
- None
-->

# Rallly Constitution

## Core Principles

### I. Code Clarity and Readability

Code MUST be written with clarity as the primary goal. Variable names, function names, and structure MUST be self-explanatory. Complex logic MUST be broken down into smaller, understandable pieces. Code should read like well-written prose, making the intent obvious to anyone reading it.

**Rationale**: Clear code reduces cognitive load, speeds up onboarding, and minimizes bugs. When code is easy to read, it's easier to maintain, debug, and extend.

### II. Simplicity First

Always choose the simplest solution that meets the requirements. Avoid premature optimization, over-engineering, and unnecessary abstractions. When multiple approaches exist, prefer the one that is easiest to understand and maintain. Complexity MUST be justified with clear reasoning.

**Rationale**: Simple code is easier to understand, test, and modify. It reduces the learning curve for newcomers and minimizes the chance of introducing bugs during maintenance.

### III. Comprehensive Documentation

Code MUST include regular, meaningful comments that explain the "why" behind decisions, not just the "what". Complex algorithms, business logic, and non-obvious behavior MUST be documented. Comments should assume the reader is new to the codebase and may not understand the context.

**Rationale**: Comments serve as a learning tool for newcomers and a memory aid for future maintainers. Well-documented code reduces the time needed to understand functionality and prevents knowledge loss.

### IV. Beginner-Friendly Approach

All code MUST be written assuming the audience includes relative newcomers to full-stack development. Avoid jargon without explanation, use common patterns over clever solutions, and structure code to be approachable. When advanced techniques are necessary, they MUST be clearly documented with explanations.

**Rationale**: A beginner-friendly codebase is more accessible to contributors, reduces onboarding time, and creates a more inclusive development environment. Code that newcomers can understand is also easier for experienced developers to maintain.

### V. Minimal File Structure

Where possible, avoid creating excessive files. Prefer single files that contain related functionality over splitting into many small files. Only create separate files when there is a clear benefit (e.g., reusability, testability, or when a file becomes genuinely unwieldy). File organization MUST prioritize simplicity and ease of navigation.

**Rationale**: Fewer files mean less cognitive overhead when navigating the codebase. Single files with related functionality are easier to understand in context and reduce the need to jump between multiple files to understand a feature.

## Development Workflow

### Code Review Requirements

All code reviews MUST verify compliance with these principles. Reviewers should ask:
- Is this code easy to read and understand?
- Is this the simplest solution that works?
- Are there sufficient comments for a newcomer to understand?
- Could this be simplified further without losing functionality?
- Are files organized in the simplest way possible?

### Documentation Standards

- Complex functions MUST have JSDoc/TSDoc comments explaining purpose, parameters, and return values
- Business logic MUST include inline comments explaining the reasoning
- Non-obvious code patterns MUST be documented with examples or references
- File headers SHOULD describe the file's purpose and main responsibilities

## Governance

This constitution supersedes all other coding practices and guidelines. All PRs and code reviews MUST verify compliance with these principles. When a principle cannot be followed (e.g., performance requirements demand complexity), the deviation MUST be documented with clear justification in the code comments and PR description.

Amendments to this constitution require:
1. Documentation of the proposed change and rationale
2. Review and approval process
3. Update to this document with version increment
4. Propagation of changes to dependent templates and documentation

**Version**: 1.0.0 | **Ratified**: 2025-11-17 | **Last Amended**: 2025-11-17
