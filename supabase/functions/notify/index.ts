/// <reference lib="deno.ns" />

import { Resend } from "resend";

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

async function sendEmail(
  recipients: string[],
  template: string,
  variables: Record<string, unknown>
) {
  switch (template) {
    case "visit_reminder":
      for (const recipient of recipients) {
        await resend.emails.send({
          from: "info@proginmind.io",
          to: recipient,
          subject: "Test Visit Reminder",
          text: `Test Visit Reminder for ${recipient}`,
        });
      }
      break;
    default:
      return new Response("Invalid template", { status: 400 });
  }
}

Deno.serve(async (req: Request) => {
  const { type, recipients = [], template, variables } = await req.json();
  switch (type) {
    case "email":
      await sendEmail(recipients, template, variables);
      break;
    default:
      return new Response("Invalid type", { status: 400 });
  }
  return new Response("Sent!", { status: 200 });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
