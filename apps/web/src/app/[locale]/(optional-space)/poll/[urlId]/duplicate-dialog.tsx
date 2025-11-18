"use client";
import { Button } from "@rallly/ui/button";
import type { DialogProps } from "@rallly/ui/dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@rallly/ui/dialog";
import { useRouter } from "next/navigation";
import * as React from "react";

import { DuplicateForm } from "@/app/[locale]/(optional-space)/poll/[urlId]/duplicate-form";
import { Trans } from "@/components/trans";
import { pollToFormData } from "@/utils/poll-to-form-data";
import { trpc } from "@/trpc/client";

const formName = "duplicate-form";

/**
 * DuplicateDialog component that prepares poll data for duplication into a draft form.
 * Instead of immediately creating a new poll, this navigates to the create poll form
 * with all poll data pre-filled, allowing the user to review and modify before saving.
 */
export function DuplicateDialog({
  pollId,
  pollTitle,
  ...props
}: DialogProps & { pollId: string; pollTitle: string }) {
  const router = useRouter();
  // Fetch full poll data for transformation
  // The poll data is needed to transform all fields (options, settings, etc.)
  const pollQuery = trpc.polls.get.useQuery(
    { urlId: pollId },
    {
      enabled: props.open, // Only fetch when dialog is open
    },
  );

  const handleDuplicate = React.useCallback(
    (newTitle: string) => {
      // If poll data is not yet loaded, wait for it
      if (!pollQuery.data) {
        return;
      }

      try {
        // Transform poll data from database structure to form structure
        const formData = pollToFormData(pollQuery.data);

        // Update title with user's new title (from duplicate form)
        formData.title = newTitle;

        // Store transformed form data in sessionStorage
        // Key pattern: duplicate-poll-{pollId}
        // This will be read by the create poll page to pre-fill the form
        const storageKey = `duplicate-poll-${pollId}`;
        sessionStorage.setItem(storageKey, JSON.stringify(formData));

        // Navigate to create poll page with duplicate parameter
        // The create poll component will check for this parameter and pre-fill the form
        router.push(`/new?duplicate=${pollId}`);
      } catch (error) {
        // Handle errors gracefully - fall back to existing behavior if transformation fails
        console.error("Failed to duplicate poll:", error);
        // Could show an error toast here if needed
      }
    },
    [pollId, pollQuery.data, router],
  );

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="duplicate" />
          </DialogTitle>
          <DialogDescription>
            <Trans i18nKey="duplicateDescription" />
          </DialogDescription>
        </DialogHeader>
        <DuplicateForm
          name={formName}
          defaultValues={{
            title: pollTitle,
          }}
          onSubmit={(data) => {
            // Instead of calling mutation, prepare data and navigate
            handleDuplicate(data.title);
            // Close dialog after navigation is triggered
            props.onOpenChange?.(false);
          }}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button>
              <Trans i18nKey="cancel" />
            </Button>
          </DialogClose>
          <Button
            type="submit"
            loading={pollQuery.isLoading}
            variant="primary"
            form={formName}
            disabled={!pollQuery.data}
          >
            <Trans i18nKey="duplicate" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
