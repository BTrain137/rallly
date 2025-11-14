-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "reminder_minutes_before" INTEGER,
ADD COLUMN     "send_reminder" BOOLEAN NOT NULL DEFAULT false;
