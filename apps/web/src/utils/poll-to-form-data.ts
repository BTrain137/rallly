import dayjs from "dayjs";

import type { DateTimeOption } from "@/components/forms/poll-options-form";
import type { NewEventData } from "@/components/forms/types";

/**
 * Poll data structure from tRPC polls.get query
 * This represents the structure returned from the database query
 * Includes all fields needed for transformation to form data
 */
type PollFromQuery = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  timeZone: string | null;
  options: Array<{
    id: string;
    startTime: Date;
    duration: number;
  }>;
  hideParticipants: boolean;
  hideScores: boolean;
  disableComments: boolean;
  requireParticipantEmail: boolean;
  // Additional fields that may be present but not used for transformation
  [key: string]: unknown;
};

/**
 * Transforms poll data from database structure to form data structure
 * for pre-filling the create poll form when duplicating a poll.
 *
 * This function converts:
 * - Poll database fields → NewEventData form fields
 * - Date objects → ISO date strings
 * - Options with duration → DateTimeOption[] with type detection
 *
 * @param poll - Poll data from tRPC polls.get query
 * @returns Form data structure ready for react-hook-form defaultValues
 */
export function pollToFormData(poll: PollFromQuery): NewEventData {
  // Transform options: convert database structure to form structure
  // Handles both date-only options (duration === 0) and time slot options (duration > 0)
  const transformedOptions: DateTimeOption[] = poll.options.map((option) => {
    if (option.duration === 0) {
      // Date-only option: duration is 0, so this is just a date
      // Format as YYYY-MM-DD for the form
      return {
        type: "date",
        date: dayjs(option.startTime).format("YYYY-MM-DD"),
      };
    } else {
      // Time slot option: has duration, so this is a time range
      // Convert to ISO strings for start and end times
      const start = dayjs(option.startTime);
      const end = start.add(option.duration, "minute");
      return {
        type: "timeSlot",
        start: start.toISOString(),
        end: end.toISOString(),
        duration: option.duration, // Include duration as required by TimeOption type
      };
    }
  });

  // Calculate navigation date from first option or use current date
  // This helps the calendar navigate to the right month/week when the form loads
  const navigationDate =
    poll.options.length > 0
      ? dayjs(poll.options[0].startTime).toISOString()
      : dayjs().toISOString();

  // Calculate default duration from options or use 60 minutes
  // If all time slot options have the same duration, use that; otherwise default to 60
  // This provides a sensible default for the duration picker in the form
  const durations = poll.options
    .filter((opt) => opt.duration > 0)
    .map((opt) => opt.duration);
  const defaultDuration =
    durations.length > 0 && durations.every((d) => d === durations[0])
      ? durations[0]
      : 60;

  // Build form data structure
  return {
    // Basic fields: direct mapping with null handling
    title: poll.title,
    description: poll.description ?? "",
    location: poll.location ?? "",
    // timeZone must be a string, use empty string as fallback if null
    // Empty string allows form to use browser default timezone
    timeZone: poll.timeZone ?? "",

    // Options: transformed from database structure
    // All options are included - form handles rendering even with many options
    options: transformedOptions,

    // Form defaults
    view: "month", // Default calendar view
    navigationDate, // ISO date string for calendar navigation
    duration: defaultDuration, // Default event duration in minutes

    // Settings: direct boolean mapping
    // These settings are preserved exactly as they were in the original poll
    hideParticipants: poll.hideParticipants,
    hideScores: poll.hideScores,
    disableComments: poll.disableComments,
    requireParticipantEmail: poll.requireParticipantEmail,
  };
}
