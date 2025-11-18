import { Column, Row, Section } from "@react-email/components";
import { Trans } from "react-i18next/TransWithoutContext";

import { EmailLayout } from "../components/email-layout";
import {
  Button,
  borderColor,
  Heading,
  Text,
} from "../components/styled-components";
import type { EmailContext } from "../types";

export interface EventReminderEmailProps {
  date: string;
  day: string;
  dow: string;
  time: string;
  title: string;
  hostName: string;
  pollUrl: string;
  location?: string;
  reminderTime: string;
  ctx: EmailContext;
}

const EventReminderEmail = ({
  title,
  hostName,
  pollUrl,
  day,
  dow,
  date,
  time,
  location,
  reminderTime,
  ctx,
}: EventReminderEmailProps) => {
  return (
    <EmailLayout
      ctx={ctx}
      preview={ctx.t("eventReminder_preview", {
        defaultValue: "Reminder: {title} is coming up",
        title,
        ns: "emails",
      })}
    >
      <Heading>
        {ctx.t("eventReminder_heading", {
          defaultValue: "Reminder: {title}",
          title,
          ns: "emails",
        })}
      </Heading>
      <Text>
        <Trans
          i18n={ctx.i18n}
          t={ctx.t}
          i18nKey="eventReminder_content"
          ns="emails"
          defaults="This is a reminder that <b>{title}</b> is scheduled to start in {reminderTime}."
          values={{ title, reminderTime }}
          components={{
            b: <strong />,
          }}
        />
      </Text>
      <Section data-testid="date-section">
        <Row>
          <Column style={{ width: 48 }}>
            <Section
              style={{
                borderRadius: 5,
                margin: 0,
                width: 48,
                height: 48,
                textAlign: "center",
                border: `1px solid ${borderColor}`,
              }}
            >
              <Text
                style={{ margin: "0 0 4px 0", fontSize: 10, lineHeight: 1 }}
              >
                {dow}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  lineHeight: 1,
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {day}
              </Text>
            </Section>
          </Column>
          <Column style={{ paddingLeft: 16 }} align="left">
            <Text style={{ margin: 0, fontWeight: "bold" }}>{date}</Text>
            <Text light={true} style={{ margin: 0 }}>
              {time}
            </Text>
            {location ? (
              <Text light={true} style={{ margin: "4px 0 0 0" }}>
                {location}
              </Text>
            ) : null}
          </Column>
        </Row>
      </Section>
      <Text>
        {ctx.t("eventReminder_content2", {
          defaultValue: "We hope to see you there!",
          ns: "emails",
        })}
      </Text>
      <Section style={{ marginTop: 32 }}>
        <Button href={pollUrl}>View Event</Button>
      </Section>
    </EmailLayout>
  );
};

EventReminderEmail.getSubject = (
  props: EventReminderEmailProps,
  ctx: EmailContext,
) => {
  return ctx.t("eventReminder_subject", {
    defaultValue: "Reminder: {title}",
    title: props.title,
    ns: "emails",
  });
};

export { EventReminderEmail };

