# Implementation Plan: Duplicate Polls to Draft

**Branch**: `001-duplicate-polls` | **Date**: 2025-11-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-duplicate-polls/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Modify the duplicate poll functionality to prepare poll data in a draft form instead of immediately creating a new poll. When users click "Duplicate", they will be navigated to the create poll form with all poll data pre-filled, allowing them to review and modify before saving. This changes the current behavior from immediate database creation to a draft-based workflow.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x, Next.js 14.x (App Router)  
**Primary Dependencies**: tRPC, React Hook Form, Prisma, Next.js, TailwindCSS  
**Storage**: PostgreSQL via Prisma ORM  
**Testing**: Vitest (unit tests), Playwright (integration tests)  
**Target Platform**: Web browser (modern browsers supporting React 18)  
**Project Type**: Web application (monorepo with Next.js frontend and tRPC API)  
**Performance Goals**: Duplicate operation completes within 2 seconds, form loads with pre-filled data instantly  
**Constraints**: Must preserve existing duplicate functionality for Pro users, maintain backward compatibility with current duplicate mutation, form data must be serializable for URL state or session storage  
**Scale/Scope**: Single feature modification affecting poll duplication workflow, impacts existing duplicate dialog and create poll form components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with Rallly Constitution principles:

- **Code Clarity**: ✅ The approach modifies existing components with clear intent: change duplicate flow from immediate creation to draft preparation. Component names and data flow will be self-explanatory.
- **Simplicity**: ✅ The simplest solution is to leverage existing form persistence (react-hook-form-persist) or URL state to pass data to the create form. No new abstractions needed.
- **Documentation**: ✅ Will include comments explaining why we're changing from immediate creation to draft workflow, and how data flows from duplicate action to form pre-fill.
- **Beginner-Friendly**: ✅ Uses standard React patterns (form state, navigation) that are common in Next.js applications. No advanced techniques required.
- **File Structure**: ✅ Modifies existing files only - no new files needed. Changes are localized to duplicate dialog and create poll components.

**Post-Phase 1 Re-check**: All principles remain compliant. The implementation uses existing form infrastructure and standard React patterns.

## Project Structure

### Documentation (this feature)

```text
specs/001-duplicate-polls/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/src/
├── app/[locale]/(optional-space)/
│   ├── new/
│   │   └── page.tsx                    # Create poll page (needs modification to accept initial data)
│   └── poll/[urlId]/
│       └── duplicate-dialog.tsx        # Duplicate dialog (needs modification to navigate with data)
├── components/
│   ├── create-poll.tsx                 # Create poll component (needs modification to accept initial values)
│   └── forms/
│       ├── poll-details-form.tsx       # Poll details form (no changes needed)
│       ├── poll-options-form/          # Poll options form (no changes needed)
│       └── poll-settings.tsx           # Poll settings form (no changes needed)
└── trpc/routers/
    └── polls.ts                         # Polls router (may need new query for fetching poll data for duplication)

packages/database/prisma/
└── models/
    └── poll.prisma                      # Poll model (no changes needed)
```

**Structure Decision**: This is a web application monorepo. The feature modifies existing components in `apps/web/src/` without requiring new files. The duplicate functionality will pass data via URL state or session storage to the create poll form, leveraging existing form components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution principles are satisfied. The implementation uses existing components and standard React patterns without introducing unnecessary complexity.
