# Testing Reminder Functionality

This guide explains how to test the reminder feature in Rallly.

## Prerequisites

1. **Set up CRON_SECRET** (for local testing):
   Add to your `.env` file:
   ```bash
   CRON_SECRET=test-secret-key-123
   ```

2. **Ensure Mailpit is running** (to view emails):
   ```bash
   pnpm docker:up
   ```
   Mailpit will be available at http://localhost:8025

## Testing Steps

### Option 1: Quick Test (Recommended for Development)

1. **Create a poll with reminders enabled:**
   - Go to http://localhost:3000/new
   - Fill in poll details
   - In the Settings section, toggle **"Send reminder to attendees"** ON
   - Create the poll

2. **Add participants with email addresses:**
   - Add yourself as a participant with your email
   - Add a few test participants with emails

3. **Finalize the poll (book an event):**
   - Select a date/time option
   - Click "Book" or "Finalize"
   - Choose notification option (e.g., "Notify all participants")

4. **Manually trigger reminders:**
   ```bash
   # Using curl (replace with your CRON_SECRET from .env)
   curl -H "Authorization: Bearer test-secret-key-123" \
     http://localhost:3000/api/house-keeping/send-reminders
   ```

   Or use a tool like Postman/Insomnia:
   - Method: GET
   - URL: http://localhost:3000/api/house-keeping/send-reminders
   - Headers: `Authorization: Bearer test-secret-key-123`

5. **Check Mailpit:**
   - Open http://localhost:8025
   - You should see reminder emails sent to all accepted/tentative attendees

### Option 2: Test with Future Event

The reminder system sends emails when the event is within 15 minutes of the reminder time. To test this:

1. **Create a poll** with reminders enabled (default: 1 day = 1440 minutes before)

2. **Finalize the poll** with an event scheduled for:
   - **Tomorrow** (if using 1 day reminder)
   - Or **~15 minutes from now** (if you temporarily change `reminderMinutesBefore` to 15)

3. **Wait or manually trigger:**
   - The cron job runs every 15 minutes
   - Or manually call the endpoint as shown in Option 1

### Option 3: Modify for Immediate Testing

For immediate testing, you can temporarily modify the reminder logic:

1. **Edit** `apps/web/src/app/api/house-keeping/send-reminders/route.ts`
2. **Change line 97** from:
   ```typescript
   if (timeUntilReminder >= 0 && timeUntilReminder <= 15) {
   ```
   To:
   ```typescript
   if (timeUntilReminder >= -60 && timeUntilReminder <= 15) {
   ```
   This allows reminders to be sent for events up to 60 minutes in the past (for testing).

3. **Create a poll** and finalize it with an event scheduled for **now or in the past**

4. **Trigger the endpoint** manually

5. **Revert the change** after testing

## Verifying Results

1. **Check the API response:**
   ```json
   {
     "success": true,
     "sentReminders": 2,
     "errors": 0,
     "details": {
       "sentReminders": ["email1@example.com", "email2@example.com"],
       "errors": []
     }
   }
   ```

2. **Check Mailpit:**
   - Open http://localhost:8025
   - Look for emails with subject "Reminder: [Event Title]"
   - Verify email content includes event details

3. **Check the database:**
   ```sql
   -- Check polls with reminders enabled
   SELECT id, title, send_reminder, reminder_minutes_before 
   FROM polls 
   WHERE send_reminder = true;
   
   -- Check scheduled events
   SELECT se.id, se.title, se.start, p.send_reminder, p.reminder_minutes_before
   FROM scheduled_events se
   JOIN polls p ON p.scheduled_event_id = se.id
   WHERE p.send_reminder = true;
   ```

## Troubleshooting

### No reminders sent?

1. **Check if poll is finalized:**
   ```sql
   SELECT status FROM polls WHERE id = 'your-poll-id';
   -- Should be 'finalized'
   ```

2. **Check if event exists:**
   ```sql
   SELECT scheduled_event_id FROM polls WHERE id = 'your-poll-id';
   -- Should not be NULL
   ```

3. **Check reminder settings:**
   ```sql
   SELECT send_reminder, reminder_minutes_before 
   FROM polls WHERE id = 'your-poll-id';
   -- send_reminder should be true, reminder_minutes_before should not be NULL
   ```

4. **Check timing:**
   - The reminder is sent when: `eventStart - reminderMinutesBefore` is within 15 minutes of now
   - For a 1-day reminder (1440 minutes), the event should be scheduled for tomorrow

### CRON_SECRET error?

Make sure you've added `CRON_SECRET` to your `.env` file and restarted the dev server.

### Emails not appearing in Mailpit?

1. Check that Mailpit is running: `docker ps | grep mailpit`
2. Verify SMTP settings in `.env` point to Mailpit:
   ```bash
   SMTP_HOST=0.0.0.0
   SMTP_PORT=1025
   SMTP_SECURE=false
   ```

## Production Testing

In production, the cron job runs automatically every 15 minutes. To test:

1. Create a poll with reminders
2. Finalize it with an event scheduled appropriately
3. Wait for the cron job to run (or trigger manually with the production CRON_SECRET)

