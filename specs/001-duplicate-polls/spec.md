# Feature Specification: Duplicate Polls to Draft

**Feature Branch**: `001-duplicate-polls`  
**Created**: 2025-11-17  
**Status**: Draft  
**Input**: User description: "I want to create a new feature that duplicate the polls. I want to duplicate existing polls but not create them. I want it ready to be saved."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Duplicate Poll to Draft Form (Priority: P1)

A poll organizer wants to create a new poll based on an existing poll. Instead of immediately creating a duplicate poll in the database, they want to duplicate the poll data into a draft form where they can review, modify, and then save when ready.

**Why this priority**: This is the core functionality - allowing users to duplicate poll data into an editable draft form rather than immediately creating a new poll. This gives users control over when the duplicate is saved and allows them to make modifications before committing.

**Independent Test**: Can be fully tested by duplicating an existing poll and verifying that the create poll form opens with all poll data pre-filled, allowing the user to review and modify before saving.

**Acceptance Scenarios**:

1. **Given** a user is viewing an existing poll they have admin access to, **When** they click "Duplicate" from the manage poll menu, **Then** they are navigated to the create poll form with all poll data pre-filled (title, description, location, time zone, date options, and poll settings)
2. **Given** a user has duplicated a poll to the draft form, **When** they review and modify any fields, **Then** the changes are reflected in the form and they can save the poll when ready
3. **Given** a user has duplicated a poll to the draft form, **When** they decide not to create the poll, **Then** they can navigate away without saving and no poll is created in the database

---

### Edge Cases

- What happens when a user duplicates a poll that has been finalized? The duplicate should include all poll data but the new poll should start with "live" status
- What happens when a user duplicates a poll with many date options? All options should be copied to the draft form
- How does the system handle duplicating a poll that belongs to a space? The duplicate should be prepared for the same space context
- What happens if the user navigates away from the draft form without saving? No poll should be created and the draft data should be lost (standard form behavior)
- How does the system handle duplicating a poll with participants and votes? The duplicate should NOT include participants or votes - only the poll structure and settings

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users with admin access to a poll to duplicate that poll's data into a draft form
- **FR-002**: System MUST pre-fill the create poll form with all poll data from the source poll including: title, description, location, time zone, date options, and poll settings (hide participants, hide scores, disable comments, require participant email)
- **FR-003**: System MUST NOT create a new poll in the database when duplicating - the poll should only be created when the user explicitly saves the form
- **FR-004**: System MUST navigate users to the create poll form after initiating duplication
- **FR-005**: System MUST exclude participants and votes from the duplicated data - only poll structure and settings should be copied
- **FR-006**: System MUST allow users to modify any pre-filled data in the draft form before saving
- **FR-007**: System MUST create the new poll with "live" status regardless of the source poll's status
- **FR-008**: System MUST preserve the space context when duplicating polls that belong to a space

### Key Entities *(include if feature involves data)*

- **Poll**: The source poll being duplicated, containing title, description, location, time zone, options (date/time slots), and settings (visibility, comments, scores, email requirements)
- **Poll Draft**: The in-memory form state containing duplicated poll data that has not yet been saved to the database

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can duplicate a poll and have all poll data pre-filled in the create form within 2 seconds of clicking duplicate
- **SC-002**: 95% of users successfully complete the duplicate-to-draft workflow (duplicate → review → save) on their first attempt
- **SC-003**: Users can modify at least 5 different poll fields (title, description, location, dates, settings) in the draft form before saving
- **SC-004**: No duplicate polls are created in the database until the user explicitly saves the form
