"use client";
import { Button } from "@rallly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rallly/ui/card";
import { Form } from "@rallly/ui/form";
import { toast } from "@rallly/ui/sonner";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import useFormPersist from "react-hook-form-persist";
import { useUnmount } from "react-use";
import { PollSettingsForm } from "@/components/forms/poll-settings";
import { Trans } from "@/components/trans";
import { useUser } from "@/components/user-provider";
import { trpc } from "@/trpc/client";
import type { NewEventData } from "./forms";
import { PollDetailsForm, PollOptionsForm } from "./forms";

const required = <T,>(v: T | undefined): T => {
  if (!v) {
    throw new Error("Required value is missing");
  }

  return v;
};

export interface CreatePollPageProps {
  title?: string;
  location?: string;
  description?: string;
  view?: "week" | "month";
}

/**
 * CreatePoll component that allows users to create new polls.
 * Supports pre-filling form data from duplicate poll workflow via sessionStorage.
 * When a duplicate parameter is present in the URL, it checks sessionStorage for
 * pre-filled data and uses that instead of the default form persistence.
 */
export const CreatePoll: React.FunctionComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createGuestIfNeeded } = useUser();

  // Check if this is a duplicate flow
  const duplicatePollId = searchParams.get("duplicate");

  // Initialize form with default values
  // These will be overridden if duplicate data exists
  const form = useForm<NewEventData>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      view: "month",
      options: [],
      hideScores: false,
      hideParticipants: false,
      disableComments: false,
      duration: 60,
      sendReminder: false,
      reminderMinutesBefore: null,
    },
  });

  // Form persistence for draft saving (localStorage)
  // This is only used if no duplicate data exists
  // If duplicate data exists, we skip persistence to let duplicate data take precedence
  const formPersistKey = duplicatePollId ? "disabled" : "new-poll";
  const { clear } = useFormPersist(formPersistKey, {
    watch: form.watch,
    setValue: form.setValue,
  });

  // Handle duplicate data pre-fill on component mount
  React.useEffect(() => {
    if (!duplicatePollId) {
      // No duplicate parameter - use normal form persistence
      return;
    }

    try {
      // Check sessionStorage for duplicate poll data
      // Key pattern: duplicate-poll-{pollId}
      const storageKey = `duplicate-poll-${duplicatePollId}`;
      const duplicateDataStr = sessionStorage.getItem(storageKey);

      if (duplicateDataStr) {
        // Parse the stored form data
        const duplicateData = JSON.parse(duplicateDataStr) as NewEventData;

        // Pre-fill form with duplicate data
        // Reset form first to clear any existing values
        form.reset(duplicateData);

        // Clear sessionStorage after pre-fill
        // This ensures the data is only used once
        sessionStorage.removeItem(storageKey);
      }
    } catch (error) {
      // Handle errors gracefully - if sessionStorage read fails, fall back to normal form
      // This handles edge cases like:
      // - SessionStorage quota exceeded (very unlikely but possible)
      // - Invalid JSON data
      // - Browser security restrictions
      console.error("Failed to load duplicate poll data:", error);
      // Could show an error toast here if needed
    }
  }, [duplicatePollId, form]);

  useUnmount(clear);

  const createPoll = trpc.polls.create.useMutation({
    networkMode: "always",
    onError: (error) => {
      if (error.data?.code === "BAD_REQUEST") {
        toast.error(error.message);
      }
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (formData) => {
          const title = required(formData?.title.trim());
          await createGuestIfNeeded();
          await createPoll.mutateAsync(
            {
              title: title,
              location: formData?.location?.trim(),
              description: formData?.description?.trim(),
              timeZone: formData?.timeZone,
              hideParticipants: formData?.hideParticipants,
              disableComments: formData?.disableComments,
              hideScores: formData?.hideScores,
              requireParticipantEmail: formData?.requireParticipantEmail,
              sendReminder: formData?.sendReminder,
              reminderMinutesBefore: formData?.reminderMinutesBefore,
              options: required(formData?.options).map((option) => ({
                startDate: option.type === "date" ? option.date : option.start,
                endDate: option.type === "timeSlot" ? option.end : undefined,
              })),
            },
            {
              onSuccess: (res) => {
                router.push(`/poll/${res.id}`);
              },
            },
          );
        })}
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans i18nKey="event" defaults="Event" />
              </CardTitle>
              <CardDescription>
                <Trans
                  i18nKey="describeYourEvent"
                  defaults="Describe what your event is about"
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PollDetailsForm />
            </CardContent>
          </Card>

          <PollOptionsForm />

          <PollSettingsForm />
          <hr />
          <Button
            loading={form.formState.isSubmitting || createPoll.isSuccess}
            size="lg"
            type="submit"
            className="w-full"
            variant="primary"
          >
            <Trans i18nKey="createPoll" defaults="Create poll" />
          </Button>
        </div>
      </form>
    </Form>
  );
};
