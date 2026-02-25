/// <reference lib="deno.ns" />

import React from "react";
import { renderAsync } from "@react-email/components";
import { createEvent } from "ics";
import { Resend } from "resend";

import { VisitCreatedClient } from "./_templates/visit-created-client.tsx";
import { VisitCreatedStaff } from "./_templates/visit-created-staff.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const FROM_EMAIL = "info@proginmind.io";

type SendResult = { ok: true } | { ok: false; status: number; message: string };

type IcsAttachment = { filename: string; content: string; content_type: string };

/**
 * Generate an ICS calendar event attachment.
 * Returns null (and logs) if startIso is missing, invalid, or ics generation fails –
 * callers send the email without attachment in that case.
 */
function buildIcsAttachment(
  startIso: string | undefined,
  durationMinutes: number | undefined,
  title: string,
  description?: string
): IcsAttachment | null {
  if (!startIso || !durationMinutes) return null;

  const start = new Date(startIso);
  if (isNaN(start.getTime())) {
    console.warn("buildIcsAttachment: invalid startIso", startIso);
    return null;
  }

  const { error, value } = createEvent({
    title,
    description,
    start: [
      start.getUTCFullYear(),
      start.getUTCMonth() + 1,
      start.getUTCDate(),
      start.getUTCHours(),
      start.getUTCMinutes(),
    ],
    startInputType: "utc",
    duration: { minutes: durationMinutes },
    status: "CONFIRMED",
    busyStatus: "BUSY",
  });

  if (error || !value) {
    console.warn("buildIcsAttachment: createEvent error", error);
    return null;
  }

  // btoa only handles Latin1; encode to UTF-8 bytes first to support any unicode in names/notes.
  const bytes = new TextEncoder().encode(value);
  const base64 = btoa(bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), ""));

  return {
    filename: "appointment.ics",
    content: base64,
    content_type: "text/calendar",
  };
}

async function sendEmail(
  recipients: string[],
  template: string,
  templateData: Record<string, string>
): Promise<SendResult> {
  switch (template) {
    case "visit_created_client": {
      const durationMinutes = templateData.durationMinutes
        ? parseInt(templateData.durationMinutes)
        : undefined;
      const props = {
        memberName: templateData.memberName,
        serviceName: templateData.serviceName,
        date: templateData.date,
        time: templateData.time,
        durationMinutes,
        staffName: templateData.staffName,
        notes: templateData.notes,
        orgName: templateData.orgName,
        orgPhone: templateData.orgPhone,
        orgEmail: templateData.orgEmail,
        orgWebsite: templateData.orgWebsite,
        orgAddress: templateData.orgAddress,
      };
      const html = await renderAsync(React.createElement(VisitCreatedClient, props));
      const subject = "Your appointment has been confirmed";
      const icsTitle = templateData.staffName
        ? `${templateData.serviceName} with ${templateData.staffName}`
        : templateData.serviceName;
      const icsAttachment = buildIcsAttachment(
        templateData.startIso,
        durationMinutes,
        icsTitle,
        templateData.notes
      );
      for (const recipient of recipients) {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipient,
          subject,
          html,
          ...(icsAttachment ? { attachments: [icsAttachment] } : {}),
        });
        if (error) {
          return { ok: false, status: 500, message: error.message };
        }
      }
      return { ok: true };
    }

    case "visit_created_staff": {
      const durationMinutes = templateData.durationMinutes
        ? parseInt(templateData.durationMinutes)
        : undefined;
      const props = {
        staffName: templateData.staffName,
        memberName: templateData.memberName,
        serviceName: templateData.serviceName,
        date: templateData.date,
        time: templateData.time,
        durationMinutes,
        notes: templateData.notes,
        orgName: templateData.orgName,
        orgPhone: templateData.orgPhone,
        orgEmail: templateData.orgEmail,
        orgWebsite: templateData.orgWebsite,
        orgAddress: templateData.orgAddress,
      };
      const html = await renderAsync(React.createElement(VisitCreatedStaff, props));
      const subject = "New appointment assigned to you";
      const icsTitle = templateData.memberName
        ? `${templateData.serviceName} – ${templateData.memberName}`
        : templateData.serviceName;
      const icsAttachment = buildIcsAttachment(
        templateData.startIso,
        durationMinutes,
        icsTitle,
        templateData.notes
      );
      for (const recipient of recipients) {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipient,
          subject,
          html,
          ...(icsAttachment ? { attachments: [icsAttachment] } : {}),
        });
        if (error) {
          return { ok: false, status: 500, message: error.message };
        }
      }
      return { ok: true };
    }

    default:
      return { ok: false, status: 400, message: `Invalid template: ${template}` };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { type, recipients = [], template, templateData = {} } = body;

    switch (type) {
      case "email": {
        await sendEmail(recipients, template, templateData);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      default: {
        return new Response(JSON.stringify({ error: "Invalid type. Use type: 'email'." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  } catch (e) {
    console.error("notify error:", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` and set RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
  2. supabase functions serve notify --no-verify-jwt --env-file .env

  3. Visit created for client:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify' \
    --header 'Authorization: Bearer <anon-key>' \
    --header 'Content-Type: application/json' \
    --data '{
      "type": "email",
      "recipients": ["john.doe@example.com"],
      "template": "visit_created_client",
      "templateData": {
        "memberName": "John Doe",
        "staffName": "Jane Doe",
        "serviceName": "Consultation",
        "date": "Monday, March 1, 2025",
        "time": "10:00 AM",
        "durationMinutes": "60",
        "notes": "First visit",
        "startIso": "2025-03-01T10:00:00.000Z"
      }
    }'

  4. Visit created for staff:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify' \
    --header 'Authorization: Bearer <anon-key>' \
    --header 'Content-Type: application/json' \
    --data '{
      "type": "email",
      "recipients": ["jane.doe@example.com"],
      "template": "visit_created_staff",
      "templateData": {
        "staffName": "Jane Doe",
        "memberName": "John Doe",
        "serviceName": "Consultation",
        "date": "Monday, March 1, 2025",
        "time": "10:00 AM",
        "durationMinutes": "60",
        "notes": "First visit",
        "startIso": "2025-03-01T10:00:00.000Z"
      }
    }'

*/
