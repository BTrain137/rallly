# Tasks: Duplicate Polls to Draft

**Input**: Design documents from `/specs/001-duplicate-polls/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested in the feature specification. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/web/src/` at repository root
- Paths shown below use the web app structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Understand existing codebase structure and prepare for implementation

- [ ] T001 Review existing duplicate dialog implementation in apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx
- [ ] T002 Review existing create poll component in apps/web/src/components/create-poll.tsx
- [ ] T003 Review existing form types in apps/web/src/components/forms/types.ts
- [ ] T004 Review existing poll data structure from tRPC polls.get query response

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create pollToFormData transformation utility function in apps/web/src/utils/poll-to-form-data.ts that converts Poll database structure to NewEventData form structure
- [ ] T006 [P] Add transformation logic for date-only options (duration === 0) to return type: "date" with ISO date string in apps/web/src/utils/poll-to-form-data.ts
- [ ] T007 [P] Add transformation logic for time-slot options (duration > 0) to return type: "timeSlot" with ISO start/end strings in apps/web/src/utils/poll-to-form-data.ts
- [ ] T008 [P] Add mapping for all poll settings (hideParticipants, hideScores, disableComments, requireParticipantEmail) in apps/web/src/utils/poll-to-form-data.ts
- [ ] T009 [P] Add mapping for basic poll fields (title, description, location, timeZone) in apps/web/src/utils/poll-to-form-data.ts
- [ ] T010 [P] Add form defaults handling (view: "month", navigationDate, duration) in apps/web/src/utils/poll-to-form-data.ts

**Checkpoint**: Foundation ready - transformation utility complete and tested. User story implementation can now begin.

---

## Phase 3: User Story 1 - Duplicate Poll to Draft Form (Priority: P1) 🎯 MVP

**Goal**: Allow users to duplicate poll data into a draft form where they can review and modify before saving, instead of immediately creating a new poll.

**Independent Test**: Can be fully tested by duplicating an existing poll and verifying that the create poll form opens with all poll data pre-filled, allowing the user to review and modify before saving.

### Implementation for User Story 1

- [ ] T011 [US1] Modify duplicate dialog to fetch poll data (if not already available) in apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx
- [ ] T012 [US1] Add transformation call to convert poll data to form data using pollToFormData utility in apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx
- [ ] T013 [US1] Store transformed form data in sessionStorage with key pattern duplicate-poll-{pollId} in apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx
- [ ] T014 [US1] Replace mutation call with navigation to /new?duplicate={pollId} in apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx
- [ ] T015 [US1] Remove or comment out existing duplicate mutation call in apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx
- [ ] T016 [US1] Add useEffect hook in CreatePoll component to check for duplicate query parameter in apps/web/src/components/create-poll.tsx
- [ ] T017 [US1] Add sessionStorage read logic to retrieve duplicate-poll-{pollId} data when duplicate parameter exists in apps/web/src/components/create-poll.tsx
- [ ] T018 [US1] Add form pre-fill logic to set form defaultValues from sessionStorage data in apps/web/src/components/create-poll.tsx
- [ ] T019 [US1] Add sessionStorage cleanup after form is pre-filled in apps/web/src/components/create-poll.tsx
- [ ] T020 [US1] Ensure existing form persistence (localStorage) is checked only if no duplicate data exists in apps/web/src/components/create-poll.tsx
- [ ] T021 [US1] Add error handling for sessionStorage read/write operations in apps/web/src/components/create-poll.tsx
- [ ] T022 [US1] Verify form accepts and displays all pre-filled fields (title, description, location, timeZone, options, settings) in apps/web/src/components/create-poll.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can duplicate a poll and see all data pre-filled in the create form.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and edge case handling that affect the feature

- [ ] T023 [P] Add comments explaining the duplicate-to-draft workflow and data flow in apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx
- [ ] T024 [P] Add comments explaining sessionStorage usage and form pre-fill logic in apps/web/src/components/create-poll.tsx
- [ ] T025 [P] Add comments explaining transformation logic and edge cases in apps/web/src/utils/poll-to-form-data.ts
- [ ] T026 Handle edge case: poll with no timeZone (set to undefined, form handles default) in apps/web/src/utils/poll-to-form-data.ts
- [ ] T027 Handle edge case: poll with finalized status (status not copied, new poll always "live") - verify this is handled by create mutation
- [ ] T028 Handle edge case: poll with many options (all options included, form handles rendering) - verify transformation includes all options
- [ ] T029 Handle edge case: sessionStorage quota exceeded (fall back to existing form persistence) in apps/web/src/components/create-poll.tsx
- [ ] T030 Verify space context is preserved (existing polls.create mutation handles this automatically)
- [ ] T031 Verify participants and votes are excluded from duplication (transformation only includes poll structure and settings)
- [ ] T032 Test duplicate flow with polls containing date-only options
- [ ] T033 Test duplicate flow with polls containing time-slot options
- [ ] T034 Test duplicate flow with polls containing all settings enabled
- [ ] T035 Test navigation away without saving (verify no poll created and sessionStorage cleared)
- [ ] T036 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3)**: Depends on Foundational phase completion
  - User Story 1 can proceed after Phase 2
- **Polish (Phase 4)**: Depends on User Story 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within User Story 1

- Transformation utility (T005-T010) must be complete before dialog modifications (T011-T015)
- Dialog modifications (T011-T015) must be complete before create poll component changes (T016-T022)
- All implementation tasks (T011-T022) must be complete before polish tasks (T023-T036)

### Parallel Opportunities

- All Foundational tasks (T005-T010) marked [P] can run in parallel (all modify the same utility file, but can be done sequentially)
- Polish tasks (T023-T025) marked [P] can run in parallel (different files)
- Testing tasks (T032-T035) can run in parallel after implementation is complete

---

## Parallel Example: User Story 1

```bash
# Note: Most tasks in this feature are sequential due to dependencies
# However, some polish tasks can run in parallel:

# Polish comments can be added in parallel:
Task: "Add comments explaining the duplicate-to-draft workflow in duplicate-dialog.tsx"
Task: "Add comments explaining sessionStorage usage in create-poll.tsx"
Task: "Add comments explaining transformation logic in poll-to-form-data.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (review existing code)
2. Complete Phase 2: Foundational (transformation utility)
3. Complete Phase 3: User Story 1 (duplicate to draft flow)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add Polish tasks → Test edge cases → Final deployment

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: Dialog modifications (T011-T015)
   - Developer B: Create poll component changes (T016-T022) - can start after T011-T015
3. Both complete and integrate
4. Team works on polish tasks in parallel

---

## Notes

- [P] tasks = different files, no dependencies (within same phase)
- [Story] label maps task to specific user story for traceability
- User Story 1 should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- This feature modifies existing files only - no new files required
- Transformation utility can be added to existing utils directory or new file
- All changes are client-side only - no server-side modifications needed

