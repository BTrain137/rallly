# API Contracts: Duplicate Polls to Draft

**Feature**: Duplicate Polls to Draft  
**Date**: 2025-11-17  
**Phase**: 1 - Design & Contracts

## Overview

This feature does **not** require new API endpoints. It leverages existing endpoints and client-side data transformation.

## Existing Endpoints Used

### `polls.get` (tRPC Query)

**Purpose**: Fetch poll data for duplication (if not already available in component state)

**Input**:
```typescript
{
  urlId: string  // Poll URL ID
}
```

**Output**: Poll object with all fields needed for transformation

**Usage**: Called from duplicate dialog if poll data is not already available in context

### `polls.create` (tRPC Mutation)

**Purpose**: Create new poll from form data (unchanged)

**Input**:
```typescript
{
  title: string
  location?: string
  description?: string
  timeZone?: string
  hideParticipants: boolean
  hideScores: boolean
  disableComments: boolean
  requireParticipantEmail: boolean
  options: Array<{
    startDate: string  // ISO date string
    endDate?: string   // ISO date string (optional, for time slots)
  }>
}
```

**Output**: Created poll with ID

**Usage**: Called when user submits the create poll form (unchanged behavior)

## Client-Side Data Flow

### No New API Contracts Needed

The feature works entirely through:
1. **Client-side data transformation**: Poll → NewEventData
2. **Client-side storage**: SessionStorage for data transfer
3. **Client-side navigation**: Next.js router navigation
4. **Existing form submission**: Uses existing `polls.create` mutation

## Data Transformation Contract

### Function Signature

```typescript
function pollToFormData(poll: Poll): NewEventData
```

**Input Type**: Poll (from database via `polls.get`)
**Output Type**: NewEventData (form data structure)

**Contract Guarantees**:
- All poll fields are mapped to form fields
- Options are correctly transformed (date vs timeSlot)
- Settings are preserved
- Form validation requirements are met

## SessionStorage Contract

### Key Format

```
duplicate-poll-{pollId}
```

Where `{pollId}` is the poll's unique identifier.

### Value Format

JSON stringified `NewEventData` object.

### Lifecycle Contract

1. **Creation**: When duplicate action is triggered
2. **Read**: When create poll page loads (checked first)
3. **Deletion**: After form is pre-filled or on form submission
4. **Expiration**: When browser tab closes (sessionStorage behavior)

## Navigation Contract

### URL Pattern

```
/new?duplicate={pollId}
```

Where `{pollId}` is the poll's unique identifier.

### Query Parameter

- `duplicate`: string (poll ID) - Optional, indicates this is a duplicate flow

### Behavior

- If `duplicate` parameter exists: Check sessionStorage for duplicate data
- If `duplicate` parameter missing: Use normal form (existing behavior)

## Summary

**No new API endpoints required**. The feature uses:
- Existing `polls.get` query (optional, if data not in context)
- Existing `polls.create` mutation (unchanged)
- Client-side transformation and storage
- Standard Next.js navigation

This keeps the implementation simple and maintains backward compatibility.

