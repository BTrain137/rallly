# Quickstart: Duplicate Polls to Draft

**Feature**: Duplicate Polls to Draft  
**Date**: 2025-11-17

## Overview

This feature modifies the duplicate poll functionality to prepare poll data in a draft form instead of immediately creating a new poll. Users can review and modify the duplicated poll data before saving.

## User Flow

1. User views an existing poll they have admin access to
2. User clicks "Duplicate" from the manage poll menu
3. User is navigated to the create poll form with all poll data pre-filled
4. User reviews and optionally modifies the poll data
5. User clicks "Create Poll" to save the new poll

## Technical Implementation Summary

### Key Changes

1. **Duplicate Dialog** (`apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx`):
   - Remove mutation call that immediately creates poll
   - Add navigation to `/new?duplicate={pollId}` with poll data in sessionStorage

2. **Create Poll Component** (`apps/web/src/components/create-poll.tsx`):
   - Check for duplicate data in sessionStorage on mount
   - Pre-fill form with duplicate data if available
   - Clear sessionStorage after pre-fill

3. **Data Transformation**:
   - Create utility function to transform poll database structure to form data structure
   - Handle date-only vs time-slot option conversion
   - Map all poll settings to form fields

### Files to Modify

- `apps/web/src/app/[locale]/(optional-space)/poll/[urlId]/duplicate-dialog.tsx`
- `apps/web/src/components/create-poll.tsx`
- `apps/web/src/app/[locale]/(optional-space)/new/page.tsx` (if needed for query param handling)

### New Files (Optional)

- Utility function for poll-to-form transformation (can be added to existing utils file)

## Testing Checklist

### Manual Testing

- [ ] Duplicate a poll with date-only options
- [ ] Duplicate a poll with time-slot options
- [ ] Duplicate a poll with all settings enabled
- [ ] Modify pre-filled data before saving
- [ ] Navigate away without saving (verify no poll created)
- [ ] Verify space context is preserved
- [ ] Test with finalized polls
- [ ] Test with polls that have many options

### Automated Testing

- [ ] Unit test for poll-to-form transformation function
- [ ] Integration test for duplicate → create flow
- [ ] Test sessionStorage read/write behavior
- [ ] Test form pre-fill with various poll configurations

## Success Criteria Validation

- ✅ Duplicate operation completes within 2 seconds
- ✅ Form loads with pre-filled data instantly
- ✅ All poll fields are correctly pre-filled
- ✅ User can modify any field before saving
- ✅ No poll is created until user explicitly saves

## Rollback Plan

If issues arise, the feature can be rolled back by:
1. Reverting duplicate dialog to use existing mutation
2. Removing sessionStorage checks from create poll component
3. No database migrations needed (no schema changes)

## Next Steps

1. Implement duplicate dialog changes
2. Implement create poll component changes
3. Add transformation utility function
4. Test thoroughly
5. Deploy

