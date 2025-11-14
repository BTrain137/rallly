import { prisma } from "@rallly/database";
import { absoluteUrl } from "@rallly/utils/absolute-url";
import dayjs from "dayjs";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { handle } from "hono/vercel";

import { formatEventDateTime } from "@/features/scheduled-event/utils";
import { getEmailClient } from "@/utils/emails";

const app = new Hono().basePath("/api/house-keeping/send-reminders");

app.use("*", async (c, next) => {
  if (process.env.CRON_SECRET) {
    return bearerAuth({ token: process.env.CRON_SECRET })(c, next);
  }

  return c.json(
    {
      error: "CRON_SECRET is not set in environment variables",
    },
    500
  );
});

/**
 * Sends reminder emails for events that are scheduled to start within
 * the reminder time window. This endpoint should be called periodically
 * (e.g., every 15 minutes) via a cron job.
 */
app.get("/", async (c) => {
  const now = dayjs();
  const sentReminders: string[] = [];
  const errors: string[] = [];

  try {
    // Find all finalized polls with reminders enabled that have scheduled events
    const pollsWithReminders = await prisma.poll.findMany({
      where: {
        status: "finalized",
        sendReminder: true,
        reminderMinutesBefore: { not: null },
        scheduledEventId: { not: null },
        scheduledEvent: {
          status: "confirmed",
          deletedAt: null,
        },
      },
      select: {
        id: true,
        title: true,
        location: true,
        reminderMinutesBefore: true,
        user: {
          select: {
            name: true,
          },
        },
        scheduledEvent: {
          select: {
            id: true,
            start: true,
            end: true,
            allDay: true,
            timeZone: true,
            invites: {
              where: {
                status: { in: ["accepted", "tentative"] },
              },
              select: {
                id: true,
                inviteeName: true,
                inviteeEmail: true,
                inviteeTimeZone: true,
              },
            },
          },
        },
      },
    });

    for (const poll of pollsWithReminders) {
      if (!poll.scheduledEvent || !poll.reminderMinutesBefore) {
        continue;
      }

      const eventStart = dayjs(poll.scheduledEvent.start);
      const reminderTime = eventStart.subtract(
        poll.reminderMinutesBefore,
        "minute"
      );

      // Check if we're within a 15-minute window before the reminder should be sent
      // This allows for some flexibility in cron job timing
      const timeUntilReminder = reminderTime.diff(now, "minute");

      if (timeUntilReminder >= 0 && timeUntilReminder <= 15) {
        // Send reminders to all accepted/tentative attendees
        for (const invite of poll.scheduledEvent.invites) {
          if (!invite.inviteeEmail) {
            continue;
          }

          try {
            const { date, day, dow, time } = formatEventDateTime({
              start: poll.scheduledEvent.start,
              end: poll.scheduledEvent.end,
              allDay: poll.scheduledEvent.allDay,
              timeZone: poll.scheduledEvent.timeZone,
              inviteeTimeZone: invite.inviteeTimeZone ?? undefined,
            });

            // Format reminder time (e.g., "1 day", "2 hours", "30 minutes")
            let reminderTimeText = "";
            const minutes = poll.reminderMinutesBefore;
            if (minutes >= 1440) {
              const days = Math.floor(minutes / 1440);
              reminderTimeText = `${days} ${days === 1 ? "day" : "days"}`;
            } else if (minutes >= 60) {
              const hours = Math.floor(minutes / 60);
              reminderTimeText = `${hours} ${hours === 1 ? "hour" : "hours"}`;
            } else {
              reminderTimeText = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
            }

            await getEmailClient().sendTemplate("EventReminderEmail", {
              to: invite.inviteeEmail,
              props: {
                pollUrl: absoluteUrl(`/invite/${poll.id}`),
                title: poll.title,
                hostName: poll.user?.name ?? "",
                date,
                day,
                dow,
                time,
                location: poll.location ?? undefined,
                reminderTime: reminderTimeText,
              },
            });

            sentReminders.push(invite.inviteeEmail);
          } catch (error) {
            const errorMessage = `Failed to send reminder to ${invite.inviteeEmail}: ${error instanceof Error ? error.message : String(error)}`;
            errors.push(errorMessage);
            console.error(errorMessage, error);
          }
        }
      }
    }

    return c.json({
      success: true,
      sentReminders: sentReminders.length,
      errors: errors.length,
      details: {
        sentReminders,
        errors,
      },
    });
  } catch (error) {
    console.error("Error in send-reminders cron job:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export const GET = handle(app);
