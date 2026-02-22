/// <reference lib="deno.ns" />

import React from "react";
import { renderAsync } from "@react-email/components";
import { Resend } from "resend";

import { VisitCreatedClient } from "./_templates/visit-created-client.tsx";
import { VisitCreatedStaff } from "./_templates/visit-created-staff.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const FROM_EMAIL = "info@proginmind.io";

type SendResult = { ok: true } | { ok: false; status: number; message: string };

async function sendEmail(
  recipients: string[],
  template: string,
  variables: Record<string, unknown>
): Promise<SendResult> {
  switch (template) {
    case "visit_created_client": {
      const props = {
        memberName: String(variables.memberName ?? ""),
        serviceName: String(variables.serviceName ?? ""),
        date: String(variables.date ?? ""),
        time: String(variables.time ?? ""),
        durationMinutes:
          variables.durationMinutes != null ? Number(variables.durationMinutes) : undefined,
        staffName: variables.staffName != null ? String(variables.staffName) : undefined,
        notes: variables.notes != null ? String(variables.notes) : undefined,
      };
      const html = await renderAsync(React.createElement(VisitCreatedClient, props));
      const subject = "Your appointment has been confirmed";
      for (const recipient of recipients) {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipient,
          subject,
          html,
        });
        if (error) {
          return { ok: false, status: 500, message: error.message };
        }
      }
      return { ok: true };
    }

    case "visit_created_staff": {
      const props = {
        staffName: String(variables.staffName ?? ""),
        memberName: String(variables.memberName ?? ""),
        serviceName: String(variables.serviceName ?? ""),
        date: String(variables.date ?? ""),
        time: String(variables.time ?? ""),
        durationMinutes:
          variables.durationMinutes != null ? Number(variables.durationMinutes) : undefined,
        notes: variables.notes != null ? String(variables.notes) : undefined,
      };
      const html = await renderAsync(React.createElement(VisitCreatedStaff, props));
      const subject = "New appointment assigned to you";
      for (const recipient of recipients) {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipient,
          subject,
          html,
        });
        if (error) {
          return { ok: false, status: 500, message: error.message };
        }
      }
      return { ok: true };
    }

    case "visit_reminder":
      for (const recipient of recipients) {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipient,
          subject: "Visit Reminder",
          text: `Visit Reminder for ${recipient}`,
        });
        if (error) {
          return { ok: false, status: 500, message: error.message };
        }
      }
      return { ok: true };

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
    const { type, recipients = [], template, variables = {} } = body;

    if (type !== "email") {
      return new Response(JSON.stringify({ error: "Invalid type. Use type: 'email'." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "recipients must be a non-empty array of email addresses" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!template || typeof template !== "string") {
      return new Response(JSON.stringify({ error: "template is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await sendEmail(recipients, template, variables);

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.message }), {
        status: result.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Sent!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Set RESEND_API_KEY in .env and run: supabase functions serve notify --no-verify-jwt --env-file .env
  3. Example: visit created for client

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify' \
    --header 'Authorization: Bearer <anon-key>' \
    --header 'Content-Type: application/json' \
    --data '{
      "type": "email",
      "recipients": ["client@example.com"],
      "template": "visit_created_client",
      "variables": {
        "memberName": "Jane Doe",
        "serviceName": "Consultation",
        "date": "Monday, March 1, 2025",
        "time": "10:00 AM",
        "durationMinutes": 60,
        "staffName": "Dr. Smith",
        "notes": "First visit"
      }
    }'

  4. Example: visit created for staff

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify' \
    --header 'Authorization: Bearer <anon-key>' \
    --header 'Content-Type: application/json' \
    --data '{
      "type": "email",
      "recipients": ["staff@example.com"],
      "template": "visit_created_staff",
      "variables": {
        "staffName": "Dr. Smith",
        "memberName": "Jane Doe",
        "serviceName": "Consultation",
        "date": "Monday, March 1, 2025",
        "time": "10:00 AM",
        "durationMinutes": 60,
        "notes": "First visit"
      }
    }'

*/
