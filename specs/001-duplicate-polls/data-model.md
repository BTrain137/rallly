# Data Model: Duplicate Polls to Draft

**Feature**: Duplicate Polls to Draft  
**Date**: 2025-11-17  
**Phase**: 1 - Design & Contracts

## Entities

### Poll (Source - Database)

The poll entity from the database that serves as the source for duplication.

**Fields**:
- `id`: string (unique identifier)
- `title`: string (poll title)
- `description`: string | null (optional description)
- `location`: string | null (optional location)
- `timeZone`: string | null (optional timezone, e.g., "America/New_York")
- `options`: Option[] (array of date/time options)
- `hideParticipants`: boolean (visibility setting)
- `hideScores`: boolean (score visibility setting)
- `disableComments`: boolean (comments enabled/disabled)
- `requireParticipantEmail`: boolean (email requirement setting)
- `status`: "live" | "paused" | "finalized" (poll status - not copied)
- `spaceId`: string | null (space context - preserved via create mutation)

**Relationships**:
- `options`: One-to-many with Option entity
- Excluded from duplication: `participants`, `votes`, `comments`, `watchers`

### Option (Source - Database)

Date/time option within a poll.

**Fields**:
- `id`: string (unique identifier - not needed for duplication)
- `startTime`: Date (start date/time of the option)
- `duration`: number (duration in minutes, 0 for date-only options)

**Transformation Rules**:
- If `duration === 0`: Transform to date-only option (`type: "date"`)
- If `duration > 0`: Transform to time slot option (`type: "timeSlot"`)
- `startTime` Date → ISO string for form

### NewEventData (Target - Form State)

The form data structure used by the create poll form.

**Fields** (from `apps/web/src/components/forms/types.ts`):
- `title`: string (required)
- `description`: string (optional)
- `location`: string (optional)
- `timeZone`: string | undefined (optional)
- `view`: "week" | "month" (calendar view, default: "month")
- `navigationDate`: string (ISO date string for calendar navigation)
- `duration`: number (default event duration in minutes, default: 60)
- `options`: DateTimeOption[] (array of selected date/time options)
- `hideParticipants`: boolean (default: false)
- `hideScores`: boolean (default: false)
- `disableComments`: boolean (default: false)
- `requireParticipantEmail`: boolean (default: false)

### DateTimeOption (Form Structure)

Individual date/time option in the form.

**Fields**:
- `type`: "date" | "timeSlot" (determines if date-only or time range)
- `date`: string (ISO date string, used when `type === "date"`)
- `start`: string (ISO datetime string, used when `type === "timeSlot"`)
- `end`: string (ISO datetime string, used when `type === "timeSlot"`)

## Data Transformation

### Transformation Function: `pollToFormData(poll: Poll): NewEventData`

**Purpose**: Convert poll database structure to form data structure for pre-filling the create poll form.

**Transformation Logic**:

1. **Basic Fields** (direct mapping):
   - `poll.title` → `formData.title`
   - `poll.description ?? ""` → `formData.description`
   - `poll.location ?? ""` → `formData.location`
   - `poll.timeZone ?? undefined` → `formData.timeZone`

2. **Settings** (direct mapping):
   - `poll.hideParticipants` → `formData.hideParticipants`
   - `poll.hideScores` → `formData.hideScores`
   - `poll.disableComments` → `formData.disableComments`
   - `poll.requireParticipantEmail` → `formData.requireParticipantEmail`

3. **Options Transformation**:
   ```typescript
   poll.options.map(option => {
     if (option.duration === 0) {
       // Date-only option
       return {
         type: "date",
         date: dayjs(option.startTime).format("YYYY-MM-DD")
       };
     } else {
       // Time slot option
       const start = dayjs(option.startTime);
       const end = start.add(option.duration, "minute");
       return {
         type: "timeSlot",
         start: start.toISOString(),
         end: end.toISOString()
       };
     }
   })
   ```

4. **Form Defaults**:
   - `view`: "month" (default calendar view)
   - `navigationDate`: First option's date or current date
   - `duration`: Calculate from options or use default 60 minutes

**Validation Rules**:
- `title` must be non-empty (enforced by form validation)
- `options` array must contain at least one option (enforced by form validation)
- Date strings must be valid ISO format
- Time slots must have valid start < end relationship

## State Management

### SessionStorage Structure

**Key Pattern**: `duplicate-poll-{pollId}`

**Value**: JSON stringified `NewEventData` object

**Lifecycle**:
1. Created when duplicate action is triggered
2. Read when create poll page loads
3. Cleared after form is pre-filled or on form submission
4. Automatically cleared when browser tab closes (sessionStorage behavior)

### Form Persistence Integration

**Existing Persistence**: `react-hook-form-persist` uses localStorage key `"new-poll"`

**Priority Order**:
1. Check sessionStorage for duplicate data first
2. If duplicate data exists, use it and clear the key
3. If no duplicate data, fall back to existing localStorage persistence
4. This ensures duplicate always takes precedence over draft

## Data Flow

```
User clicks "Duplicate"
  ↓
Fetch poll data (if not already available)
  ↓
Transform poll → NewEventData
  ↓
Store in sessionStorage: duplicate-poll-{pollId}
  ↓
Navigate to /new?duplicate={pollId}
  ↓
Create poll page loads
  ↓
Check sessionStorage for duplicate-poll-{pollId}
  ↓
If found: Pre-fill form, clear sessionStorage
  ↓
If not found: Use existing form persistence
  ↓
User reviews/modifies form
  ↓
User clicks "Create Poll"
  ↓
Form submits → polls.create mutation
  ↓
New poll created in database
```

## Edge Cases

1. **Poll with no options**: Should not happen (polls require at least one option), but form validation will catch this
2. **Poll with finalized status**: Status is not copied, new poll always starts as "live"
3. **Poll with many options**: All options are included, form handles rendering
4. **Poll with no timeZone**: timeZone is set to undefined, form uses browser default
5. **SessionStorage quota exceeded**: Very unlikely, but would fall back to existing form persistence
6. **User navigates away without saving**: SessionStorage is cleared, no poll created (expected behavior)

