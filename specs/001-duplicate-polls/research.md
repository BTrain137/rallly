# Research: Duplicate Polls to Draft

**Feature**: Duplicate Polls to Draft  
**Date**: 2025-11-17  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. How to pass poll data from duplicate action to create form?

**Decision**: Use URL search parameters with base64-encoded JSON or sessionStorage for passing poll data to the create form.

**Rationale**: 
- Next.js App Router supports searchParams in page components
- SessionStorage provides client-side persistence without URL length limits
- React Hook Form already uses form persistence (react-hook-form-persist) which we can leverage
- This approach is simple, doesn't require new API endpoints, and works with existing form infrastructure

**Alternatives Considered**:
- **New tRPC endpoint**: Would require server-side handling and adds complexity. Rejected because we want to avoid database writes until user saves.
- **URL state with query params**: Simple but has URL length limitations. Could work for small polls but may fail for polls with many options.
- **LocalStorage**: Persists across sessions which we don't want. SessionStorage is better as it clears when tab closes.
- **React Context/State**: Would require shared state management. More complex than needed for this single navigation flow.

**Implementation Approach**:
1. When duplicate is clicked, fetch poll data (if not already available)
2. Transform poll data to match `NewEventData` form structure
3. Store in sessionStorage with a unique key (e.g., `duplicate-poll-{pollId}`)
4. Navigate to `/new?duplicate={pollId}` 
5. Create poll page reads from sessionStorage and pre-fills form
6. Clear sessionStorage after form is loaded or on form submission

### 2. How to transform poll data to form structure?

**Decision**: Create a transformation function that maps poll database structure to `NewEventData` form structure.

**Rationale**:
- Poll options are stored as `startTime` (Date) and `duration` (minutes) in database
- Form expects `DateTimeOption[]` with `type: "date" | "timeSlot"` and date/time strings
- Need to convert Date objects to ISO strings and determine if option is date-only or time slot
- Settings map directly (hideParticipants, hideScores, disableComments, requireParticipantEmail)

**Transformation Mapping**:
```typescript
Poll (DB) → NewEventData (Form)
- title → title
- description → description  
- location → location
- timeZone → timeZone
- options[].startTime + duration → options[] (with type detection)
- hideParticipants → hideParticipants
- hideScores → hideScores
- disableComments → disableComments
- requireParticipantEmail → requireParticipantEmail
```

**Edge Cases**:
- Poll with no timeZone: Use undefined, form will handle default
- Poll with duration = 0: Treat as date-only option
- Poll with duration > 0: Treat as timeSlot option
- Poll with many options: All should be included, form handles rendering

### 3. How to handle existing duplicate mutation?

**Decision**: Keep existing `polls.duplicate` mutation for backward compatibility but modify the duplicate dialog to use new draft flow instead.

**Rationale**:
- Existing mutation may be used elsewhere or by API consumers
- Changing behavior of existing mutation could break integrations
- New flow is client-side only, doesn't need server changes
- Can deprecate old mutation later if needed

**Implementation**:
- Modify `DuplicateDialog` to navigate to `/new?duplicate={pollId}` instead of calling mutation
- Remove or comment out the mutation call
- Keep mutation code in place for now (can be removed in future cleanup)

### 4. How to ensure form pre-fill works with existing form persistence?

**Decision**: Use sessionStorage with a specific key pattern that doesn't conflict with existing `react-hook-form-persist` which uses localStorage key `"new-poll"`.

**Rationale**:
- Existing form persistence uses localStorage with key `"new-poll"`
- We want duplicate data to take precedence over any existing draft
- SessionStorage ensures data is cleared when tab closes (better UX)
- Can check for duplicate data first, then fall back to existing persistence

**Implementation Flow**:
1. Check sessionStorage for `duplicate-poll-{pollId}` key
2. If found, use that data and clear the key
3. If not found, use existing form persistence (localStorage `"new-poll"`)
4. This ensures duplicate always takes precedence but doesn't break existing draft functionality

### 5. How to handle space context preservation?

**Decision**: Space context is automatically preserved because the create poll mutation (`polls.create`) already handles space assignment based on the current user's space.

**Rationale**:
- The `polls.create` mutation checks if user is logged in and assigns to their current space
- No additional logic needed - the form doesn't need to explicitly pass spaceId
- When user saves the duplicated poll, it will be created in the same space context as the original (if user has access)

**Implementation**:
- No changes needed - existing space handling in `polls.create` works correctly
- The duplicated poll will be created in the user's current space when saved

## Technical Decisions Summary

1. **Data Transfer**: SessionStorage with URL parameter for navigation
2. **Data Transformation**: Client-side function to map poll DB structure to form structure  
3. **Backward Compatibility**: Keep existing mutation, change dialog behavior only
4. **Form Integration**: Check sessionStorage first, then fall back to existing persistence
5. **Space Context**: Rely on existing space handling in create mutation

## Open Questions Resolved

- ✅ How to pass data: SessionStorage + URL param
- ✅ How to transform data: Client-side transformation function
- ✅ How to handle existing mutation: Keep it, change dialog only
- ✅ How to integrate with form: Check sessionStorage before existing persistence
- ✅ How to preserve space: Existing create mutation handles it

## Next Steps

Proceed to Phase 1: Design & Contracts to define:
- Data model for poll-to-form transformation
- API contracts (if any new endpoints needed)
- Component interfaces and data flow

